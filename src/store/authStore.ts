import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthRepository } from "@/infrastructure/supabase/authRepository";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  setUser(user: User | null): void;
  clearError(): void;
}

type AuthStore = AuthState & AuthActions;

let authRepo: SupabaseAuthRepository | null = null;
function getAuthRepo() {
  if (!authRepo) authRepo = new SupabaseAuthRepository();
  return authRepo;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),

      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await getAuthRepo().signUp({ email, password });
          set({ user, isLoading: false });
        } catch (e) {
          set({ error: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await getAuthRepo().signIn({ email, password });
          set({ user, isLoading: false });
        } catch (e) {
          set({ error: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await getAuthRepo().signOut();
          set({ user: null, isLoading: false });
        } catch (e) {
          set({ error: (e as Error).message, isLoading: false });
          throw e;
        }
      },
    }),
    { name: "AuthStore" }
  )
);
