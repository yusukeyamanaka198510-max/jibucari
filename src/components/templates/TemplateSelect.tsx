"use client";

import Link from "next/link";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── ドキュメントモック ─────────────────────────────────────── */
function DocMock({ hasPhoto = false, lines = 5 }: { hasPhoto?: boolean; lines?: number }) {
  return (
    <div className="w-full aspect-[4/3] bg-white rounded-xl border border-slate-100 p-3 flex gap-2 overflow-hidden">
      {hasPhoto && (
        <div className="w-9 h-11 rounded bg-slate-200 shrink-0 self-start mt-0.5" />
      )}
      <div className="flex-1 space-y-1.5 pt-0.5">
        <div className="h-2 w-3/5 rounded-full bg-slate-700" />
        <div className="h-1.5 w-4/5 rounded-full bg-slate-300" />
        {Array.from({ length: lines - 2 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-1.5 rounded-full bg-slate-200", i % 3 === 2 ? "w-2/5" : i % 2 === 0 ? "w-4/5" : "w-3/5")}
          />
        ))}
      </div>
    </div>
  );
}

/* ── テンプレート定義 ──────────────────────────────────────── */
const TEMPLATES = [
  {
    type: "link" as const,
    href: "/resume/new?format=career_change",
    label: "転職履歴書",
    sub: "職歴欄をしっかり書ける標準タイプ",
    size: "A4 / 2枚",
    hasPhoto: true,
    lines: 6,
    accent: "from-indigo-500 to-violet-500",
    badgeBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=new_graduate",
    label: "新卒履歴書",
    sub: "学歴・自己PRを中心に整理",
    size: "A4 / 2枚",
    hasPhoto: true,
    lines: 5,
    accent: "from-violet-500 to-purple-500",
    badgeBg: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=part_time",
    label: "アルバイト履歴書",
    sub: "勤務希望やシフトを記入しやすい",
    size: "A4 / 1枚",
    hasPhoto: true,
    lines: 4,
    accent: "from-sky-500 to-indigo-500",
    badgeBg: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=no_photo",
    label: "写真なし履歴書",
    sub: "WEB応募向けの写真なしタイプ",
    size: "A4 / 1枚",
    hasPhoto: false,
    lines: 5,
    accent: "from-indigo-400 to-sky-500",
    badgeBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    type: "link" as const,
    href: "/cv/new",
    label: "職務経歴書",
    sub: "職務要約・経歴・スキルを整理",
    size: "A4 / 複数枚",
    hasPhoto: false,
    lines: 6,
    accent: "from-purple-500 to-indigo-500",
    badgeBg: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    type: "disabled" as const,
    label: "両方まとめて作る",
    sub: "履歴書と職務経歴書をまとめて作成",
    size: "",
    hasPhoto: false,
    lines: 5,
    accent: "from-slate-300 to-slate-400",
    badgeBg: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "次期対応",
  },
];

/* ── コンポーネント ────────────────────────────────────────── */
export function TemplateSelect() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              TOP
            </Link>
            <span className="text-slate-200 select-none">|</span>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              ジブキャリ
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="pt-32 pb-10 px-5 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.10) 0%, transparent 70%)",
        }}
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            テンプレートを選んでください
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            どの書類を{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              作りますか？
            </span>
          </h1>
          <p className="text-slate-500 text-sm">全テンプレート無料・登録不要。あとからでも変更できます。</p>
        </div>
      </section>

      {/* ── テンプレートグリッド ── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((t) => {
            const isDisabled = t.type === "disabled";

            const cardInner = (
              <>
                {/* アクセントライン */}
                <div className={cn("absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b", t.accent)} />

                {/* バッジ */}
                <div className="flex items-center gap-2 mb-3 pl-1">
                  {t.size && (
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", t.badgeBg)}>
                      {t.size}
                    </span>
                  )}
                  {t.type === "disabled" && (
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", t.badgeBg)}>
                      {t.badge}
                    </span>
                  )}
                </div>

                {/* モック */}
                <div className="pl-1">
                  <DocMock hasPhoto={t.hasPhoto} lines={t.lines} />
                </div>

                {/* テキスト */}
                <div className="mt-4 pl-1 space-y-1 flex-1">
                  <p className={cn("font-bold text-base", isDisabled ? "text-slate-400" : "text-slate-900")}>
                    {t.label}
                  </p>
                  <p className="text-xs text-slate-500">{t.sub}</p>
                </div>

                {/* CTA */}
                <div className="mt-4 pl-1">
                  {isDisabled ? (
                    <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold text-center">
                      準備中
                    </div>
                  ) : (
                    <div className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold text-center flex items-center justify-center gap-1.5 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-shadow">
                      この書類で作る
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </>
            );

            return isDisabled ? (
              <div
                key={t.label}
                className="relative flex flex-col bg-white rounded-2xl border border-slate-200 p-5 opacity-50"
              >
                {cardInner}
              </div>
            ) : (
              <Link
                key={(t as { href: string }).href}
                href={(t as { href: string }).href}
                className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-200"
              >
                {cardInner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8 px-5 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-700 mb-1">ジブキャリ</p>
        <p>© 2025 ジブキャリ. All rights reserved.</p>
      </footer>
    </div>
  );
}
