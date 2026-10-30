export interface GroupMember {
  userId: string;
  canInvite: boolean;
  joinedAt: number;
}

export interface Group {
  id: string;
  ownerId: string;
  createdAt: number;
  members: GroupMember[];
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedBy: string;
  invitedUserId: string;
  createdAt: number;
}

export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface GroupInvitationEvent {
  invitationId: string;
  groupId: string;
  userId?: string;
}

export interface GroupMemberJoinedEvent {
  userId: string;
  group: Group;
}

export interface GroupMemberLeftEvent {
  groupId: string;
  userId: string;
}

export interface GroupPermissionUpdatedEvent {
  groupId: string;
  memberId: string;
  canInvite: boolean;
}

export interface GroupDestroyedEvent {
  groupId: string;
  reason: "owner_left" | "owner_discarded" | string;
}
