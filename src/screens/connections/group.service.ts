import { emitWithAck } from "./group-socket.requests";
import { useGroupStore } from "./group.store";
import { Group, GroupInvitation } from "./group.types";
import { ConnectionEvents as E } from "./socket.events";

export const groupService = {
  async createGroup(): Promise<Group> {
    const group = await emitWithAck<Group>(E.GROUP_CREATE);

    useGroupStore.getState().setGroup(group);

    return group;
  },

  async getGroup(): Promise<Group | null> {
    const result = await emitWithAck<{ group: Group | null }>(E.GROUP_GET);

    useGroupStore.getState().setGroup(result.group);

    return result.group;
  },

  async getPendingInvitations(): Promise<GroupInvitation[]> {
    const invitations = await emitWithAck<GroupInvitation[]>(E.INVITATIONS_GET);

    useGroupStore.getState().setInvitations(invitations);

    return invitations;
  },

  async inviteFriend(
    groupId: string,
    invitedUserId: string,
  ): Promise<GroupInvitation> {
    return emitWithAck<GroupInvitation>(E.GROUP_INVITE, {
      groupId,
      invitedUserId,
    });
  },

  async acceptInvitation(invitationId: string): Promise<Group> {
    const group = await emitWithAck<Group>(E.INVITATION_ACCEPT, {
      invitationId,
    });

    const store = useGroupStore.getState();

    store.setGroup(group);
    store.removeInvitation(invitationId);

    return group;
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    await emitWithAck<{
      invitationId: string;
      rejected: boolean;
    }>(E.INVITATION_REJECT, {
      invitationId,
    });

    useGroupStore.getState().removeInvitation(invitationId);
  },

  async getEligibleFriends(): Promise<string[]> {
    const friendIds = await emitWithAck<string[]>(E.GROUP_FRIENDS_GET);

    useGroupStore.getState().setFriendIds(friendIds);

    return friendIds;
  },

  async setInvitePermission(
    groupId: string,
    memberId: string,
    canInvite: boolean,
  ): Promise<void> {
    await emitWithAck<{
      groupId: string;
      memberId: string;
      canInvite: boolean;
    }>(E.PERMISSION_SET, {
      groupId,
      memberId,
      canInvite,
    });

    // The server broadcasts GROUP_PERMISSION_UPDATED and
    // GROUP_UPDATED to the group room.
  },

  async leaveGroup(groupId: string): Promise<void> {
    const result = await emitWithAck<{
      destroyed: boolean;
      groupId: string;
    }>(E.GROUP_LEAVE, { groupId });

    if (result.destroyed || result.groupId === groupId) {
      useGroupStore.getState().setGroup(null);
    }
  },

  async discardGroup(groupId: string): Promise<void> {
    await emitWithAck<{
      groupId: string;
      destroyed: boolean;
      memberIds: string[];
    }>(E.GROUP_DISCARD, { groupId });

    useGroupStore.getState().setGroup(null);
  },
};
