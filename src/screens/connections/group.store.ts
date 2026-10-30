import { create } from "zustand";

import type { Group, GroupInvitation } from "./group.types";

interface GroupState {
  group: Group | null;
  invitations: GroupInvitation[];
  friendIds: string[];

  isLoadingGroup: boolean;
  isLoadingInvitations: boolean;
  isLoadingFriends: boolean;

  error: string | null;

  setGroup: (group: Group | null) => void;
  setInvitations: (invitations: GroupInvitation[]) => void;
  addInvitation: (invitation: GroupInvitation) => void;
  removeInvitation: (invitationId: string) => void;
  setFriendIds: (friendIds: string[]) => void;

  setLoadingGroup: (value: boolean) => void;
  setLoadingInvitations: (value: boolean) => void;
  setLoadingFriends: (value: boolean) => void;

  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  group: null,
  invitations: [],
  friendIds: [],
  isLoadingGroup: false,
  isLoadingInvitations: false,
  isLoadingFriends: false,
  error: null,
};

export const useGroupStore = create<GroupState>((set) => ({
  ...initialState,

  setGroup: (group) => set({ group }),

  setInvitations: (invitations) => set({ invitations }),

  addInvitation: (invitation) =>
    set((state) => {
      const exists = state.invitations.some(
        (item) => item.id === invitation.id,
      );

      if (exists) return state;

      return {
        invitations: [...state.invitations, invitation],
      };
    }),

  removeInvitation: (invitationId) =>
    set((state) => ({
      invitations: state.invitations.filter((item) => item.id !== invitationId),
    })),

  setFriendIds: (friendIds) => set({ friendIds }),

  setLoadingGroup: (isLoadingGroup) => set({ isLoadingGroup }),

  setLoadingInvitations: (isLoadingInvitations) =>
    set({ isLoadingInvitations }),

  setLoadingFriends: (isLoadingFriends) => set({ isLoadingFriends }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
