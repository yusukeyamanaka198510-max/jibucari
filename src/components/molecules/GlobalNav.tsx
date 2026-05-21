"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, X, FileText, Sparkles, HelpCircle, Clock,
  CalendarDays, User, LogOut, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/organisms/AuthModal";
import { ConsultationSheet } from "@/components/organisms/ConsultationSheet";

const NAV_ITEMS = [
  {
    icon: <FileText className="h-4 w-4" />,
    label: "書類作成",
    desc: "履歴書・職務経歴書など",
    href: "/resume/new",
    auth: false,
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    label: "AI文章生成",
    desc: "志望動機・自己PRをAIで作成",
    href: "/ai-support",
    auth: false,
  },
  {
    icon: <HelpCircle className="h-4 w-4" />,
    label: "ヘルプ",
    desc: "よくある質問・お問い合わせ",
    href: "/help",
    auth: false,
  },
  {
    icon: <Clock className="h-4 w-4" />,
    label: "作成履歴",
    desc: "過去に作成した書類一覧",
    href: "/dashboard",
    auth: true,
  },
  {
    icon: <CalendarDays className="h-4 w-4" />,
    label: "面談依頼",
    desc: "キャリア相談を申し込む",
    href: null, // モーダルで開く
    auth: true,
  },
  {
    icon: <User className="h-4 w-4" />,
    label: "マイページ",
    desc: "登録情報・プロフィール管理",
    href: "/mypage",
    auth: true,
  },
];

export function GlobalNav() {
  const [open, setOpen] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, openAuthModal } = useAuthStore();
  const router = useRouter();

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItem = (item: typeof NAV_ITEMS[0]) => {
    setOpen(false);
    if (item.auth && !user) {
      openAuthModal(window.location.pathname + window.location.search);
      return;
    }
    if (item.href === null) {
      // 面談依頼
      setShowConsult(true);
      return;
    }
    router.push(item.href);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <div ref={menuRef} className="relative">
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="メニュー"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-indigo-50"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="hidden sm:inline text-xs">メニュー</span>
      </button>

      {/* ドロップダウン */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* ユーザー情報 */}
          {user && (
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
              <p className="text-xs text-indigo-500 font-semibold truncate">{user.email}</p>
            </div>
          )}

          {/* メニュー項目 */}
          <nav className="py-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleItem(item)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
              >
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors flex items-center gap-1">
                    {item.label}
                    {item.auth && !user && (
                      <span className="text-[10px] text-slate-400 font-normal">（要ログイン）</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{item.desc}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </nav>

          {/* ログアウト */}
          {user && (
            <div className="border-t border-slate-100 py-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group"
              >
                <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-red-50 group-hover:text-red-400 transition-colors">
                  <LogOut className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-slate-500 group-hover:text-red-500 transition-colors">
                  ログアウト
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <AuthModal />
      <ConsultationSheet
        open={showConsult}
        onClose={() => setShowConsult(false)}
        name={user?.user_metadata?.full_name ?? ""}
        email={user?.email ?? ""}
        phone=""
      />
    </div>
  );
}
