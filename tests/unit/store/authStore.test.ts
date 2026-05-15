import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useAuthStore } from "@/store/authStore";

// SupabaseAuthRepository をモック
vi.mock("@/infrastructure/supabase/authRepository", () => ({
  SupabaseAuthRepository: vi.fn().mockImplementation(() => ({
    signIn: vi.fn().mockResolvedValue({ id: "user-1", email: "test@example.com" }),
    signUp: vi.fn().mockResolvedValue({ id: "user-2", email: "new@example.com" }),
    signOut: vi.fn().mockResolvedValue(undefined),
    getUser: vi.fn().mockResolvedValue(null),
  })),
}));

beforeEach(() => {
  act(() => useAuthStore.setState({ user: null, isLoading: false, error: null }));
});

describe("useAuthStore", () => {
  it("signIn 成功でユーザーがセットされる", async () => {
    await act(() => useAuthStore.getState().signIn("test@example.com", "password123"));
    expect(useAuthStore.getState().user).not.toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("signOut でユーザーが null になる", async () => {
    await act(() => useAuthStore.getState().signIn("test@example.com", "password123"));
    await act(() => useAuthStore.getState().signOut());
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("clearError でエラーが消える", () => {
    act(() => useAuthStore.setState({ error: "テストエラー" }));
    act(() => useAuthStore.getState().clearError());
    expect(useAuthStore.getState().error).toBeNull();
  });
});
