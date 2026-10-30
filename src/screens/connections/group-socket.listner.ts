import type { Socket } from "socket.io-client";

import { ConnectionEvents as E } from "./socket.events";

import type {
  Group,
  GroupInvitation,
  GroupDestroyedEvent,
  GroupMemberJoinedEvent,
  GroupMemberLeftEvent,
  GroupPermissionUpdatedEvent,
} from "./group.types";
import { getGroupSocket } from "./socket.service";
import { useGroupStore } from "./group.store";
import { groupService } from "./group.service";

let registeredSocket: Socket | null = null;

export function registerGroupSocketListeners(): () => void {
  const socket = getGroupSocket();

  if (!socket) {
    throw new Error(
      "Group socket must be initialized before registering listeners",
    );
  }

  // Prevent duplicate registration on the same socket.
  if (registeredSocket === socket) {
    return () => unregisterGroupSocketListeners(socket);
  }

  unregisterGroupSocketListeners();

  registeredSocket = socket;

  const onGroupUpdated = (group: Group) => {
    useGroupStore.getState().setGroup(group);
  };

  const onGroupCreated = (group: Group) => {
    useGroupStore.getState().setGroup(group);
  };

  const onInvitation = (invitation: GroupInvitation) => {
    useGroupStore.getState().addInvitation(invitation);
  };

  const onInvitationCancelled = (event: {
    invitationId: string;
    groupId: string;
  }) => {
    useGroupStore.getState().removeInvitation(event.invitationId);
  };

  const onInvitationRejected = (event: {
    invitationId: string;
    groupId: string;
    userId: string;
  }) => {
    // This event goes to the inviter. The current store contains
    // incoming invitations, so don't remove an unrelated invitation.
    console.log("[GroupSocket] Invitation rejected:", event);

    // We can connect this to an outgoing-invitations UI later.
  };

  const onMemberJoined = (event: GroupMemberJoinedEvent) => {
    useGroupStore.getState().setGroup(event.group);
  };

  const onMemberLeft = (_event: GroupMemberLeftEvent) => {
    // The backend also emits GROUP_UPDATED after a member leaves.
    // That event contains the complete authoritative group.
  };

  const onPermissionUpdated = (_event: GroupPermissionUpdatedEvent) => {
    // GROUP_UPDATED follows this event and provides the full group.
  };

  const onGroupDestroyed = (event: GroupDestroyedEvent) => {
    const currentGroup = useGroupStore.getState().group;

    if (currentGroup?.id === event.groupId) {
      useGroupStore.getState().setGroup(null);
    }
  };

  const onSocketError = (error: { code?: string; message?: string }) => {
    useGroupStore
      .getState()
      .setError(error.message ?? "A group connection error occurred");
  };

  const onConnect = () => {
    // The socket may have reconnected after a network interruption.
    // Fetch fresh server state instead of relying on stale local state.
    void syncGroupState();
  };

  socket.on(E.GROUP_UPDATED, onGroupUpdated);
  socket.on(E.GROUP_CREATED, onGroupCreated);
  socket.on(E.GROUP_INVITATION, onInvitation);
  socket.on(E.INVITATION_CANCELLED, onInvitationCancelled);
  socket.on(E.INVITATION_REJECTED, onInvitationRejected);
  socket.on(E.GROUP_MEMBER_JOINED, onMemberJoined);
  socket.on(E.GROUP_MEMBER_LEFT, onMemberLeft);
  socket.on(E.GROUP_PERMISSION_UPDATED, onPermissionUpdated);
  socket.on(E.GROUP_DESTROYED, onGroupDestroyed);
  socket.on(E.ERROR, onSocketError);
  socket.on("connect", onConnect);

  // The socket might already be connected when listeners are registered.
  if (socket.connected) {
    void syncGroupState();
  }

  return () => unregisterGroupSocketListeners(socket);
}

async function syncGroupState(): Promise<void> {
  const store = useGroupStore.getState();

  store.setError(null);
  store.setLoadingGroup(true);
  store.setLoadingInvitations(true);

  try {
    const [groupResult, invitationResult] = await Promise.allSettled([
      groupService.getGroup(),
      groupService.getPendingInvitations(),
    ]);

    if (groupResult.status === "rejected") {
      console.error(
        "[GroupSocket] Failed to synchronize group:",
        groupResult.reason,
      );
    }

    if (invitationResult.status === "rejected") {
      console.error(
        "[GroupSocket] Failed to synchronize invitations:",
        invitationResult.reason,
      );
    }

    if (
      groupResult.status === "rejected" &&
      invitationResult.status === "rejected"
    ) {
      useGroupStore.getState().setError("Unable to synchronize group data");
    }
  } finally {
    useGroupStore.getState().setLoadingGroup(false);
    useGroupStore.getState().setLoadingInvitations(false);
  }
}

function unregisterGroupSocketListeners(socketToRemove?: Socket): void {
  const socket = socketToRemove ?? registeredSocket;

  if (!socket) return;

  socket.off(E.GROUP_UPDATED);
  socket.off(E.GROUP_CREATED);
  socket.off(E.GROUP_INVITATION);
  socket.off(E.INVITATION_CANCELLED);
  socket.off(E.INVITATION_REJECTED);
  socket.off(E.GROUP_MEMBER_JOINED);
  socket.off(E.GROUP_MEMBER_LEFT);
  socket.off(E.GROUP_PERMISSION_UPDATED);
  socket.off(E.GROUP_DESTROYED);
  socket.off(E.ERROR);
  socket.off("connect");

  if (registeredSocket === socket) {
    registeredSocket = null;
  }
}
