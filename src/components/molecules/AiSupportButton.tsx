"use client";

import Link from "next/link";

/**
 * ファーストビュー「AIサポートを受ける」ボタン。
 * 履歴書作成の志望動機・自己PRをAIで生成するStep5へ直接遷移。
 */
export function AiSupportButton() {
  return (
    <Link
      href="/ai-support"
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold text-base px-8 py-4 rounded-2xl border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-200"
    >
      🤝 AIサポートを受ける
    </Link>
  );
}
