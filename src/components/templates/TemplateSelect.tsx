"use client";

import Link from "next/link";
import { ChevronLeft, ArrowRight } from "lucide-react";

const TEMPLATES = [
  {
    format: "jis",
    label: "JIS規格 履歴書",
    sub: "一般用・最もスタンダードな履歴書",
    badge: "定番",
    badgeColor: "bg-indigo-100 text-indigo-700",
    accent: "from-indigo-500 to-violet-500",
    bg: "hover:bg-indigo-50/60",
    border: "hover:border-indigo-300",
    emoji: "📋",
  },
  {
    format: "career_change",
    label: "転職用 履歴書",
    sub: "社会人経験をアピールする転職向け",
    badge: "人気",
    badgeColor: "bg-violet-100 text-violet-700",
    accent: "from-violet-500 to-purple-500",
    bg: "hover:bg-violet-50/60",
    border: "hover:border-violet-300",
    emoji: "💼",
  },
  {
    format: "new_graduate",
    label: "新卒用 履歴書",
    sub: "学生・第二新卒向けレイアウト",
    badge: "新卒",
    badgeColor: "bg-sky-100 text-sky-700",
    accent: "from-sky-500 to-indigo-500",
    bg: "hover:bg-sky-50/60",
    border: "hover:border-sky-300",
    emoji: "🎓",
  },
  {
    format: "part_time",
    label: "アルバイト用 履歴書",
    sub: "パート・アルバイト応募に最適",
    badge: "シンプル",
    badgeColor: "bg-emerald-100 text-emerald-700",
    accent: "from-emerald-500 to-teal-500",
    bg: "hover:bg-emerald-50/60",
    border: "hover:border-emerald-300",
    emoji: "⭐",
  },
];

export function TemplateSelect() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            TOP
          </Link>
          <span className="text-slate-200 select-none">|</span>
          <span className="font-black text-base bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ジブキャリ
          </span>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="max-w-3xl mx-auto px-5 py-12">
        <div className="text-center mb-10 space-y-2">
          <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Step 1</p>
          <h1 className="text-3xl font-black text-slate-900">テンプレートを選んでください</h1>
          <p className="text-slate-500 text-sm">あとからでも変更できます</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((t) => (
            <Link
              key={t.format}
              href={`/resume/new?format=${t.format}`}
              className={`group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 ${t.bg} ${t.border} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              {/* 左アクセントライン */}
              <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b ${t.accent}`} />

              <span className="text-4xl">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900">{t.label}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{t.sub}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          全テンプレート無料・登録不要でご利用いただけます
        </p>
      </main>
    </div>
  );
}
