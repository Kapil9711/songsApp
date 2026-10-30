import type { Group, GroupInvitation } from "./connection.types.js";

export const groups = new Map<string, Group>();

// userId -> groupId
// Ensures a user belongs to at most one group.
export const userGroups = new Map<string, string>();

// invitationId -> invitation
export const invitations = new Map<string, GroupInvitation>();

// invitedUserId -> Set<socketId>
// Useful when notifying a user about invitations across devices.
export const userSockets = new Map<string, Set<string>>();
