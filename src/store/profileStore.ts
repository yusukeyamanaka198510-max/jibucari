import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SupabaseProfileRepository, type UserProfileData } from "@/infrastructure/supabase/profileRepository";

interface ProfileState {
  profile: UserProfileData | null;
  hasProfile: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

interface ProfileActions {
  loadProfile(userId: string): Promise<void>;
  saveProfile(userId: string, data: Omit<UserProfileData, "id">): Promise<void>;
  updateField(key: keyof Omit<UserProfileData, "id">, value: unknown): void;
  clearProfile(): void;
}

type ProfileStore = ProfileState & ProfileActions;

let repo: SupabaseProfileRepository | null = null;
function getRepo() {
  if (!repo) repo = new SupabaseProfileRepository();
  return repo;
}

export const useProfileStore = create<ProfileStore>()(
  devtools(
    (set, get) => ({
      profile: null,
      hasProfile: false,
      isLoading: false,
      isSaving: false,
      error: null,

      loadProfile: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const profile = await getRepo().get(userId);
          set({ profile, hasProfile: !!profile, isLoading: false });
        } catch (e) {
          set({ error: (e as Error).message, isLoading: false });
        }
      },

      saveProfile: async (userId, data) => {
        set({ isSaving: true, error: null });
        try {
          const profile = await getRepo().upsert(userId, data);
          set({ profile, hasProfile: true, isSaving: false });
        } catch (e) {
          set({ error: (e as Error).message, isSaving: false });
          throw e;
        }
      },

      updateField: (key, value) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, [key]: value } });
      },

      clearProfile: () => set({ profile: null, hasProfile: false }),
    }),
    { name: "ProfileStore" }
  )
);
