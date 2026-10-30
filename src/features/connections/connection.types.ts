export interface GroupMember {
  userId: string;
  canInvite: boolean;
  joinedAt: number;
}

export interface Group {
  id: string;
  ownerId: string;
  members: Map<string, GroupMember>;
  createdAt: number;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedBy: string;
  invitedUserId: string;
  createdAt: number;
}

export interface GroupState {
  groups: Map<string, Group>;
  userGroups: Map<string, string>;
  invitations: Map<string, GroupInvitation>;
}
