"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/browserClient";
import { useAuthStore } from "@/store/authStore";

/**
 * Supabase のセッション状態をクライアント側の AuthStore に同期するプロバイダー。
 * OAuth リダイレクト後もセッションが正しく反映されるようにする。
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    // ページロード時に既存セッションを取得して反映
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 認証状態の変化（ログイン・ログアウト）をリアルタイムで反映
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
