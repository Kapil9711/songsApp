import { randomUUID } from "node:crypto";

import type {
  Group,
  GroupInvitation,
  GroupMember,
} from "./connection.types.js";

import { groups, userGroups, invitations } from "./connection.store.js";

import { areFriends } from "./connection.friend.service.js";

export class GroupError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "GroupError";
  }
}

function getGroupOrThrow(groupId: string): Group {
  const group = groups.get(groupId);
  if (!group) {
    throw new GroupError("Group not found", "GROUP_NOT_FOUND");
  }
  return group;
}

function getMemberOrThrow(group: Group, userId: string): GroupMember {
  const member = group.members.get(userId);
  if (!member) {
    throw new GroupError(
      "You are not a member of this group",
      "NOT_GROUP_MEMBER",
    );
  }
  return member;
}

function assertOwner(group: Group, userId: string): void {
  if (group.ownerId !== userId) {
    throw new GroupError(
      "Only the group owner can perform this action",
      "OWNER_ONLY",
    );
  }
}

export function createGroup(userId: string): Group {
  if (userGroups.has(userId)) {
    throw new GroupError("You already belong to a group", "ALREADY_IN_GROUP");
  }
  const groupId = randomUUID();
  const owner: GroupMember = {
    userId,
    canInvite: true,
    joinedAt: Date.now(),
  };
  const group: Group = {
    id: groupId,
    ownerId: userId,
    members: new Map([[userId, owner]]),
    createdAt: Date.now(),
  };
  groups.set(groupId, group);
  userGroups.set(userId, groupId);
  return group;
}

export async function inviteFriend(
  groupId: string,
  inviterId: string,
  invitedUserId: string,
): Promise<GroupInvitation> {
  if (inviterId === invitedUserId) {
    throw new GroupError("You cannot invite yourself", "CANNOT_INVITE_SELF");
  }
  const group = getGroupOrThrow(groupId);
  const inviter = getMemberOrThrow(group, inviterId);
  if (!inviter.canInvite) {
    throw new GroupError(
      "You do not have permission to invite friends",
      "INVITE_PERMISSION_DENIED",
    );
  }
  if (group.members.has(invitedUserId)) {
    throw new GroupError(
      "This user is already in the group",
      "ALREADY_GROUP_MEMBER",
    );
  }
  if (userGroups.has(invitedUserId)) {
    throw new GroupError(
      "This user already belongs to another group",
      "INVITEE_ALREADY_IN_GROUP",
    );
  }
  const friendshipExists = await areFriends(inviterId, invitedUserId);
  if (!friendshipExists) {
    throw new GroupError("You can only invite your own friends", "NOT_FRIENDS");
  }

  const duplicate = [...invitations.values()].some(
    (invitation) =>
      invitation.groupId === groupId &&
      invitation.invitedUserId === invitedUserId,
  );

  if (duplicate) {
    throw new GroupError(
      "An invitation is already pending",
      "INVITATION_ALREADY_PENDING",
    );
  }

  // Avoid conflicting invitations from another group.
  const conflictingInvitation = [...invitations.values()].some(
    (invitation) => invitation.invitedUserId === invitedUserId,
  );

  if (conflictingInvitation) {
    throw new GroupError(
      "This user already has a pending group invitation",
      "CONFLICTING_INVITATION",
    );
  }

  const invitation: GroupInvitation = {
    id: randomUUID(),
    groupId,
    invitedBy: inviterId,
    invitedUserId,
    createdAt: Date.now(),
  };

  invitations.set(invitation.id, invitation);

  return invitation;
}

export function getPendingInvitations(userId: string): GroupInvitation[] {
  return [...invitations.values()].filter(
    (invitation) => invitation.invitedUserId === userId,
  );
}

export function acceptInvitation(invitationId: string, userId: string): Group {
  const invitation = invitations.get(invitationId);

  if (!invitation || invitation.invitedUserId !== userId) {
    throw new GroupError("Invitation not found", "INVITATION_NOT_FOUND");
  }

  if (userGroups.has(userId)) {
    throw new GroupError("You already belong to a group", "ALREADY_IN_GROUP");
  }

  const group = groups.get(invitation.groupId);

  if (!group) {
    invitations.delete(invitationId);

    throw new GroupError("This group no longer exists", "GROUP_NOT_FOUND");
  }

  // Recheck before joining in case the group changed.
  if (group.members.has(userId)) {
    invitations.delete(invitationId);

    throw new GroupError(
      "You are already a member of this group",
      "ALREADY_GROUP_MEMBER",
    );
  }

  group.members.set(userId, {
    userId,
    canInvite: false,
    joinedAt: Date.now(),
  });

  userGroups.set(userId, group.id);
  invitations.delete(invitationId);

  // Remove other pending invitations for this user.
  for (const [id, pending] of invitations) {
    if (pending.invitedUserId === userId) {
      invitations.delete(id);
    }
  }

  return group;
}

export function rejectInvitation(invitationId: string, userId: string): void {
  const invitation = invitations.get(invitationId);

  if (!invitation || invitation.invitedUserId !== userId) {
    throw new GroupError("Invitation not found", "INVITATION_NOT_FOUND");
  }

  invitations.delete(invitationId);
}

export function setInvitePermission(
  groupId: string,
  ownerId: string,
  memberId: string,
  canInvite: boolean,
): Group {
  const group = getGroupOrThrow(groupId);

  assertOwner(group, ownerId);

  if (memberId === group.ownerId) {
    throw new GroupError(
      "The owner's invitation permission cannot be changed",
      "CANNOT_CHANGE_OWNER_PERMISSION",
    );
  }

  const member = getMemberOrThrow(group, memberId);
  member.canInvite = canInvite;

  return group;
}

export function leaveGroup(
  groupId: string,
  userId: string,
): { destroyed: boolean; groupId: string } {
  const group = getGroupOrThrow(groupId);

  getMemberOrThrow(group, userId);

  if (group.ownerId === userId) {
    groups.delete(groupId);

    for (const memberId of group.members.keys()) {
      userGroups.delete(memberId);
    }

    for (const [id, invitation] of invitations) {
      if (invitation.groupId === groupId) {
        invitations.delete(id);
      }
    }

    return { destroyed: true, groupId };
  }

  group.members.delete(userId);
  userGroups.delete(userId);

  return { destroyed: false, groupId };
}

export function discardGroup(groupId: string, ownerId: string): string[] {
  const group = getGroupOrThrow(groupId);

  assertOwner(group, ownerId);

  const memberIds = [...group.members.keys()];

  groups.delete(groupId);

  for (const memberId of memberIds) {
    userGroups.delete(memberId);
  }

  for (const [id, invitation] of invitations) {
    if (invitation.groupId === groupId) {
      invitations.delete(id);
    }
  }

  return memberIds;
}

export function getUserGroup(userId: string): Group | null {
  const groupId = userGroups.get(userId);

  if (!groupId) {
    return null;
  }

  return groups.get(groupId) ?? null;
}
