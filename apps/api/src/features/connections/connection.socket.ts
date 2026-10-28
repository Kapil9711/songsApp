import type { Server, Socket } from "socket.io";

import {
  acceptInvitation,
  createGroup,
  discardGroup,
  getPendingInvitations,
  getUserGroup,
  inviteFriend,
  leaveGroup,
  rejectInvitation,
  setInvitePermission,
  GroupError,
} from "./connection.service.js";

import type { PlayerSyncPayload } from "./connection.events.js";

import { groups, invitations, userGroups } from "./connection.store.js";

import { getFriendIds } from "./connection.friend.service.js";

import { ConnectionEvents as E } from "./connection.events.js";

import type { Group, GroupInvitation } from "./connection.types.js";

import type { SocketResponse } from "./connection.events.js";

type Ack = (response: SocketResponse) => void;

function userRoom(userId: string): string {
  return `user:${userId}`;
}

function groupRoom(groupId: string): string {
  return `group:${groupId}`;
}

function serializeGroup(group: Group) {
  return {
    id: group.id,
    ownerId: group.ownerId,
    createdAt: group.createdAt,
    members: [...group.members.values()],
  };
}

function sendError(socket: Socket, error: unknown, ack?: Ack): void {
  const response: SocketResponse = {
    success: false,
    error: {
      code: error instanceof GroupError ? error.code : "INTERNAL_ERROR",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    },
  };

  if (ack) {
    ack(response);
    return;
  }

  socket.emit(E.ERROR, response.error);
}

function sendSuccess<T>(ack: Ack | undefined, data: T): void {
  ack?.({
    success: true,
    data,
  });
}

function handle(
  socket: Socket,
  ack: Ack | undefined,
  action: () => unknown | Promise<unknown>,
): void {
  Promise.resolve()
    .then(action)
    .then((data) => sendSuccess(ack, data))
    .catch((error: unknown) => sendError(socket, error, ack));
}

function emitGroupUpdate(io: Server, group: Group): void {
  io.to(groupRoom(group.id)).emit(E.GROUP_UPDATED, serializeGroup(group));
}

export function registerConnectionSockets(io: Server): void {
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId as string | undefined;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // All sockets belonging to the same user share this private room.
    await socket.join(userRoom(userId));

    console.log(`Group socket connected: ${userId}`);

    // Restore group-room membership when a device reconnects.
    const existingGroup = getUserGroup(userId);

    if (existingGroup) {
      await socket.join(groupRoom(existingGroup.id));

      socket.emit(E.GROUP_UPDATED, serializeGroup(existingGroup));
    }

    socket.on(E.GROUP_CREATE, (ack?: Ack) => {
      handle(socket, ack, async () => {
        const group = createGroup(userId);

        await io.in(userRoom(userId)).socketsJoin(groupRoom(group.id));

        const result = serializeGroup(group);

        io.to(groupRoom(group.id)).emit(E.GROUP_CREATED, result);

        return result;
      });
    });

    socket.on(E.GROUP_GET, (ack?: Ack) => {
      handle(socket, ack, () => {
        const group = getUserGroup(userId);

        if (!group) {
          return { group: null };
        }

        return { group: serializeGroup(group) };
      });
    });

    socket.on(
      E.GROUP_INVITE,
      (
        payload: {
          groupId: string;
          invitedUserId: string;
        },
        ack?: Ack,
      ) => {
        handle(socket, ack, async () => {
          const invitation = await inviteFriend(
            payload.groupId,
            userId,
            payload.invitedUserId,
          );

          // Deliver the invitation to every connected device of the invitee.
          io.to(userRoom(invitation.invitedUserId)).emit(
            E.GROUP_INVITATION,
            invitation,
          );

          return invitation;
        });
      },
    );

    socket.on(E.GROUP_FRIENDS_GET, (ack?: Ack) => {
      handle(socket, ack, async () => {
        const group = getUserGroup(userId);

        if (!group) {
          throw new GroupError(
            "You do not belong to a group",
            "NOT_GROUP_MEMBER",
          );
        }

        const member = group.members.get(userId);

        if (!member || !member.canInvite) {
          throw new GroupError(
            "You do not have permission to invite friends",
            "INVITE_PERMISSION_DENIED",
          );
        }

        const friendIds = await getFriendIds(userId);

        const pendingInviteeIds = new Set(
          [...invitations.values()].map(
            (invitation) => invitation.invitedUserId,
          ),
        );

        return friendIds.filter(
          (friendId) =>
            !group.members.has(friendId) &&
            !userGroups.has(friendId) &&
            !pendingInviteeIds.has(friendId) &&
            friendId !== userId,
        );
      });
    });

    socket.on(E.INVITATIONS_GET, (ack?: Ack) => {
      handle(socket, ack, () => {
        return getPendingInvitations(userId);
      });
    });

    socket.on(
      E.INVITATION_ACCEPT,
      (payload: { invitationId: string }, ack?: Ack) => {
        handle(socket, ack, async () => {
          const group = acceptInvitation(payload.invitationId, userId);

          // All devices belonging to this user join the group room.
          await io.in(userRoom(userId)).socketsJoin(groupRoom(group.id));

          const result = serializeGroup(group);

          io.to(groupRoom(group.id)).emit(E.GROUP_MEMBER_JOINED, {
            userId,
            group: result,
          });

          emitGroupUpdate(io, group);

          return result;
        });
      },
    );

    socket.on(
      E.INVITATION_REJECT,
      (payload: { invitationId: string }, ack?: Ack) => {
        handle(socket, ack, () => {
          const invitation = invitations.get(payload.invitationId);

          // Validate ownership before deleting the invitation.
          if (!invitation || invitation.invitedUserId !== userId) {
            throw new GroupError(
              "Invitation not found",
              "INVITATION_NOT_FOUND",
            );
          }

          rejectInvitation(payload.invitationId, userId);

          io.to(userRoom(invitation.invitedBy)).emit(E.INVITATION_REJECTED, {
            invitationId: invitation.id,
            groupId: invitation.groupId,
            userId,
          });

          return {
            invitationId: payload.invitationId,
            rejected: true,
          };
        });
      },
    );

    socket.on(
      E.PERMISSION_SET,
      (
        payload: {
          groupId: string;
          memberId: string;
          canInvite: boolean;
        },
        ack?: Ack,
      ) => {
        handle(socket, ack, () => {
          const group = setInvitePermission(
            payload.groupId,
            userId,
            payload.memberId,
            payload.canInvite,
          );

          const result = {
            groupId: group.id,
            memberId: payload.memberId,
            canInvite: payload.canInvite,
          };

          io.to(groupRoom(group.id)).emit(E.GROUP_PERMISSION_UPDATED, result);

          emitGroupUpdate(io, group);

          return result;
        });
      },
    );

    socket.on(E.GROUP_LEAVE, (payload: { groupId: string }, ack?: Ack) => {
      handle(socket, ack, async () => {
        const group = groups.get(payload.groupId);

        if (!group || !group.members.has(userId)) {
          throw new GroupError(
            "You are not a member of this group",
            "NOT_GROUP_MEMBER",
          );
        }

        const memberIds = [...group.members.keys()];

        // Capture invitations before the service removes them.
        const cancelledInvitations = [...invitations.values()].filter(
          (invitation) => invitation.groupId === group.id,
        );

        const result = leaveGroup(group.id, userId);

        if (result.destroyed) {
          io.to(groupRoom(group.id)).emit(E.GROUP_DESTROYED, {
            groupId: group.id,
            reason: "owner_left",
          });

          await io.in(groupRoom(group.id)).socketsLeave(groupRoom(group.id));

          for (const invitation of cancelledInvitations) {
            io.to(userRoom(invitation.invitedUserId)).emit(
              E.INVITATION_CANCELLED,
              {
                invitationId: invitation.id,
                groupId: group.id,
              },
            );
          }

          return result;
        }

        // Remove every device belonging to the departing member.
        await io.in(userRoom(userId)).socketsLeave(groupRoom(group.id));

        io.to(groupRoom(group.id)).emit(E.GROUP_MEMBER_LEFT, {
          groupId: group.id,
          userId,
        });

        const updatedGroup = groups.get(group.id);

        if (updatedGroup) {
          emitGroupUpdate(io, updatedGroup);
        }

        return result;
      });
    });

    socket.on(E.GROUP_DISCARD, (payload: { groupId: string }, ack?: Ack) => {
      handle(socket, ack, async () => {
        const group = groups.get(payload.groupId);

        if (!group) {
          throw new GroupError("Group not found", "GROUP_NOT_FOUND");
        }

        // discardGroup performs the owner authorization check.
        const memberIds = [...group.members.keys()];

        const cancelledInvitations: GroupInvitation[] = [
          ...invitations.values(),
        ].filter((invitation) => invitation.groupId === group.id);

        const removedMemberIds = discardGroup(group.id, userId);

        io.to(groupRoom(group.id)).emit(E.GROUP_DESTROYED, {
          groupId: group.id,
          reason: "owner_discarded",
        });

        await io.in(groupRoom(group.id)).socketsLeave(groupRoom(group.id));

        for (const invitation of cancelledInvitations) {
          io.to(userRoom(invitation.invitedUserId)).emit(
            E.INVITATION_CANCELLED,
            {
              invitationId: invitation.id,
              groupId: group.id,
            },
          );
        }

        return {
          groupId: group.id,
          destroyed: true,
          memberIds: removedMemberIds,
        };
      });
    });

    // sync player

    socket.on(E.PLAYER_SYNC, (payload: PlayerSyncPayload, ack?: Ack) => {
      try {
        // 1. Get the authenticated identity from the JWT.
        const userId = socket.data.userId as string;

        // 2. Validate the payload.
        if (
          !payload ||
          typeof payload.songId !== "string" ||
          typeof payload.songUrl !== "string" ||
          typeof payload.songImage !== "string" ||
          typeof payload.artist !== "string" ||
          typeof payload.seekPosition !== "number" ||
          typeof payload.isPlaying !== "boolean" ||
          !Number.isFinite(payload.seekPosition) ||
          payload.seekPosition < 0 ||
          typeof payload.userId !== "string"
        ) {
          throw new GroupError(
            "Invalid player sync payload",
            "INVALID_PLAYER_SYNC_PAYLOAD",
          );
        }

        // 3. Ensure the payload userId matches the authenticated user.
        if (payload.userId !== userId) {
          throw new GroupError(
            "User ID does not match the authenticated user",
            "USER_ID_MISMATCH",
          );
        }

        // 4. Find the sender's current group.
        const group = getUserGroup(userId);

        if (!group || !group.members.has(userId)) {
          throw new GroupError(
            "You must belong to a group to sync playback",
            "NOT_GROUP_MEMBER",
          );
        }

        // 5. Broadcast to other group members, excluding every socket
        //    belonging to the user who initiated the event.
        const playerSync = {
          songId: payload.songId,
          seekPosition: payload.seekPosition,
          songUrl: payload.songUrl,
          songImage: payload.songImage,
          artist: payload.artist,
          isPlaying: payload.isPlaying,
          userId,
        };

        io.to(groupRoom(group.id))
          .except(userRoom(userId))
          .emit(E.PLAYER_SYNC, playerSync);

        // 6. Acknowledge successful delivery to the sender.
        ack?.({
          success: true,
          data: {
            delivered: true,
            groupId: group.id,
          },
        });
      } catch (error) {
        sendError(socket, error, ack);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Group socket disconnected: ${userId}, reason: ${reason}`);
    });
  });
}
