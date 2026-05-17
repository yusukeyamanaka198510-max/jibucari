"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/browserClient";

export function NavUser() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setChecked(true); return; }

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      setChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!checked) return null;

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/mypage"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">マイページ</span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
    >
      ログイン
    </Link>
  );
}
