"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "ユーザー管理", icon: Users, exact: false },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, isLoading } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Brand（デスクトップのみ表示、モバイルはトップバーに表示） */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-sm truncate">ジブキャリ</p>
          <p className="text-slate-500 text-xs font-medium">管理パネル</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2 pb-1.5">
          メニュー
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          ユーザーサイトへ
        </Link>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
