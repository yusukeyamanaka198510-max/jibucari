"use client";

import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/organisms/AuthModal";

/**
 * ファーストビュー「AIサポートを受ける」ボタン。
 * 未ログイン時は登録モーダルを表示し、ログイン済みの場合は面談依頼へスクロール。
 */
export function AiSupportButton() {
  const { user, openAuthModal } = useAuthStore();

  const handleClick = () => {
    if (user) {
      // ログイン済みはスカウトセクションへスクロール
      document.getElementById("scout")?.scrollIntoView({ behavior: "smooth" });
    } else {
      openAuthModal(typeof window !== "undefined" ? window.location.pathname : "/");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold text-base px-8 py-4 rounded-2xl border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-200"
      >
        🤝 AIサポートを受ける
      </button>
      <AuthModal />
    </>
  );
}
