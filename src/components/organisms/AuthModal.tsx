"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function AuthModal() {
  const { authModalOpen, authModalRedirectTo, closeAuthModal, signInWithGoogle, isLoading } = useAuthStore();
  const [agreed, setAgreed] = useState(false);
  const [scoutOptIn, setScoutOptIn] = useState(true);
  const [showError, setShowError] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogle = async () => {
    if (!agreed) { setShowError(true); return; }
    setShowError(false);
    await signInWithGoogle(authModalRedirectTo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAuthModal} />

      {/* モーダル */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-6">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ブランド */}
        <div className="text-center space-y-1">
          <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ジブキャリ
          </p>
          <h2 className="text-lg font-bold text-slate-900">保存するには登録が必要です</h2>
          <p className="text-sm text-slate-500">
            Googleアカウントで1クリック登録。<br />作成した書類をいつでも確認できます。
          </p>
        </div>

        {/* チェックボックス群 */}
        <div className="space-y-3">
          {/* 利用規約チェック */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setShowError(false); }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              <Link href="/terms" target="_blank" className="text-indigo-600 underline">利用規約</Link>
              {" "}および{" "}
              <Link href="/privacy" target="_blank" className="text-indigo-600 underline">プライバシーポリシー</Link>
              {" "}に同意します <span className="text-red-400">*</span>
            </span>
          </label>
          {showError && (
            <p className="text-xs text-red-500 pl-7">利用規約への同意が必要です</p>
          )}

          {/* スカウト・お役立ち情報の受け取り */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={scoutOptIn}
              onChange={(e) => setScoutOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              ジブキャリからの優良企業スカウト・求人情報・転職お役立ち情報を受け取る
              <span className="ml-1 text-[10px] text-slate-400">（任意）</span>
            </span>
          </label>
        </div>

        {/* Googleボタン */}
        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? "処理中..." : "Googleで登録 / ログイン"}
        </button>

        <p className="text-center text-xs text-slate-400">
          すでにアカウントをお持ちの方も同じボタンでログインできます
        </p>
      </div>
    </div>
  );
}
