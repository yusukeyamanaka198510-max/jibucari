"use client";

import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* モバイル用トップバー */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 flex items-center justify-between px-4 z-40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-sm">ジブキャリ管理</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="メニュー"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* モバイル用バックドロップ */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* サイドバー */}
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* メインコンテンツ */}
      <div className="lg:pl-64 pt-14 lg:pt-0 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
