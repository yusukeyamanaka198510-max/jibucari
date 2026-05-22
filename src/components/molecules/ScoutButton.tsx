"use client";

import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/organisms/AuthModal";

/**
 * スカウト登録ボタン。
 * 未ログイン時は登録モーダルを表示し、ログイン済みの場合はマイページへ遷移。
 */
export function ScoutButton() {
  const { user, openAuthModal } = useAuthStore();

  const handleClick = () => {
    if (user) {
      window.location.href = "/mypage";
    } else {
      openAuthModal(typeof window !== "undefined" ? window.location.pathname : "/");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/60 hover:scale-105 transition-all duration-200"
      >
        ✦ 無料で登録してスカウトを待つ
      </button>
      <AuthModal />
    </>
  );
}
