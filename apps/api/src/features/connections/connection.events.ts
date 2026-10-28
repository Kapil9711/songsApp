export const ConnectionEvents = {
  GROUP_CREATE: "group:create",
  GROUP_GET: "group:get",
  GROUP_INVITE: "group:invite",
  INVITATIONS_GET: "group:invitations:get",
  INVITATION_ACCEPT: "group:invitation:accept",
  INVITATION_REJECT: "group:invitation:reject",
  PERMISSION_SET: "group:permission:set",
  GROUP_LEAVE: "group:leave",
  GROUP_DISCARD: "group:discard",
  GROUP_FRIENDS_GET: "group:friends:get",

  GROUP_CREATED: "group:created",
  GROUP_UPDATED: "group:updated",
  GROUP_INVITATION: "group:invitation",
  INVITATION_CANCELLED: "group:invitation:cancelled",
  INVITATION_REJECTED: "group:invitation:rejected",
  GROUP_MEMBER_JOINED: "group:member-joined",
  GROUP_MEMBER_LEFT: "group:member-left",
  GROUP_PERMISSION_UPDATED: "group:permission-updated",
  GROUP_DESTROYED: "group:destroyed",

  ERROR: "connection:error",

  PLAYER_SYNC: "playerSync",
} as const;

export interface GroupCreatePayload {}

export interface GroupInvitePayload {
  groupId: string;
  invitedUserId: string;
}

export interface InvitationActionPayload {
  invitationId: string;
}

export interface GroupPermissionPayload {
  groupId: string;
  memberId: string;
  canInvite: boolean;
}

export interface GroupActionPayload {
  groupId: string;
}

export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PlayerSyncPayload {
  songId: string;
  seekPosition: number;
  songUrl: string;
  songImage: string;
  artist: string;
  userId: string;
  isPlaying: boolean;
}
