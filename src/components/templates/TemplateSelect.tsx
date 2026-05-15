"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── ドキュメントモック ─────────────────────────────────────── */
function DocMock({ lines = 5, hasPhoto = false }: { lines?: number; hasPhoto?: boolean }) {
  return (
    <div className="w-full aspect-[3/2] bg-white rounded-lg border border-slate-200 p-3 flex gap-2 overflow-hidden">
      {hasPhoto && (
        <div className="w-10 h-12 rounded bg-slate-200 shrink-0 self-start" />
      )}
      <div className="flex-1 space-y-1.5 pt-0.5">
        <div className="h-2.5 w-3/5 rounded bg-slate-700" />
        <div className="h-1.5 w-4/5 rounded bg-slate-300" />
        <div className="h-1.5 w-2/3 rounded bg-slate-200" />
        {Array.from({ length: Math.max(0, lines - 3) }).map((_, i) => (
          <div key={i} className={cn("h-1.5 rounded bg-slate-200", i % 2 === 0 ? "w-4/5" : "w-3/5")} />
        ))}
      </div>
    </div>
  );
}

/* ── テンプレート定義 ──────────────────────────────────────── */
type TemplateItem =
  | { type: "link"; format: string; href: string; label: string; sub: string; size: string; badge?: string; badgeColor?: string; hasPhoto?: boolean; lines?: number }
  | { type: "disabled"; label: string; sub: string; size: string; badge: string; badgeColor: string; lines?: number };

const TEMPLATES: TemplateItem[] = [
  {
    type: "link",
    format: "career_change",
    href: "/resume/new?format=career_change",
    label: "転職履歴書",
    sub: "職歴欄をしっかり書ける標準タイプ",
    size: "A4 / 2枚",
    hasPhoto: true,
    lines: 6,
  },
  {
    type: "link",
    format: "new_graduate",
    href: "/resume/new?format=new_graduate",
    label: "新卒履歴書",
    sub: "学歴・自己PRを中心に整理",
    size: "A4 / 2枚",
    hasPhoto: true,
    lines: 5,
  },
  {
    type: "link",
    format: "part_time",
    href: "/resume/new?format=part_time",
    label: "アルバイト履歴書",
    sub: "勤務希望やシフトを記入しやすい",
    size: "A4 / 1枚",
    hasPhoto: true,
    lines: 4,
  },
  {
    type: "link",
    format: "no_photo",
    href: "/resume/new?format=no_photo",
    label: "写真なし履歴書",
    sub: "WEB応募向けの写真なしタイプ",
    size: "A4 / 1枚",
    hasPhoto: false,
    lines: 5,
  },
  {
    type: "link",
    format: "cv",
    href: "/cv/new",
    label: "職務経歴書",
    sub: "職務要約・経歴・スキルを整理",
    size: "A4 / 複数枚",
    hasPhoto: false,
    lines: 6,
  },
  {
    type: "disabled",
    label: "両方まとめて作る",
    sub: "履歴書と職務経歴書をまとめて作成",
    size: "",
    badge: "次期対応",
    badgeColor: "bg-amber-100 text-amber-700",
    lines: 5,
  },
];

/* ── コンポーネント ────────────────────────────────────────── */
export function TemplateSelect() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-3">
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
      <main className="max-w-4xl mx-auto px-5 py-12">
        <div className="text-center mb-10 space-y-2">
          <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Step 1</p>
          <h1 className="text-3xl font-black text-slate-900">テンプレートを選んでください</h1>
          <p className="text-slate-500 text-sm">あとからでも変更できます</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((t) => {
            if (t.type === "disabled") {
              return (
                <div
                  key={t.label}
                  className="relative flex flex-col bg-white rounded-2xl border border-slate-200 p-5 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", t.badgeColor)}>
                      {t.badge}
                    </span>
                  </div>
                  <DocMock lines={t.lines} hasPhoto={false} />
                  <div className="mt-4 space-y-1">
                    <p className="font-bold text-slate-900">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.sub}</p>
                  </div>
                  <div className="mt-4 w-full py-3 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold text-center">
                    準備中
                  </div>
                </div>
              );
            }

            return (
              <div key={t.format} className="relative flex flex-col bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-3">
                  {t.size && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      {t.size}
                    </span>
                  )}
                  {t.badge && (
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", t.badgeColor)}>
                      {t.badge}
                    </span>
                  )}
                </div>
                <DocMock lines={t.lines} hasPhoto={t.hasPhoto} />
                <div className="mt-4 space-y-1 flex-1">
                  <p className="font-bold text-slate-900">{t.label}</p>
                  <p className="text-xs text-slate-500">{t.sub}</p>
                </div>
                <Link
                  href={t.href}
                  className="mt-4 block w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold text-center transition-colors"
                >
                  この履歴書で作る
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          全テンプレート無料・登録不要でご利用いただけます
        </p>
      </main>
    </div>
  );
}
