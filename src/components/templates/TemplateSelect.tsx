"use client";

import Link from "next/link";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OwlCharacter } from "@/components/atoms/OwlCharacter";

/* ── テンプレート定義 ──────────────────────────────────────── */
const TEMPLATES = [
  {
    type: "link" as const,
    href: "/resume/new?format=career_change",
    emoji: "💼",
    label: "転職履歴書",
    sub: "職歴をしっかり書きたい方向け",
    tags: ["社会人経験あり", "転職活動中"],
    accent: "border-indigo-400",
    iconBg: "bg-indigo-50",
    tagBg: "bg-indigo-50 text-indigo-600",
    btnClass: "bg-indigo-600 hover:bg-indigo-700",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=new_graduate",
    emoji: "🎓",
    label: "新卒履歴書",
    sub: "学歴・自己PRを中心に構成",
    tags: ["就活中の学生", "第二新卒"],
    accent: "border-violet-400",
    iconBg: "bg-violet-50",
    tagBg: "bg-violet-50 text-violet-600",
    btnClass: "bg-violet-600 hover:bg-violet-700",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=jis",
    emoji: "📄",
    label: "JIS規格 履歴書",
    sub: "最も一般的なスタンダード様式",
    tags: ["汎用", "書類選考全般"],
    accent: "border-sky-400",
    iconBg: "bg-sky-50",
    tagBg: "bg-sky-50 text-sky-600",
    btnClass: "bg-sky-600 hover:bg-sky-700",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=part_time",
    emoji: "⏰",
    label: "アルバイト履歴書",
    sub: "希望シフト・勤務条件も書ける",
    tags: ["パート", "アルバイト応募"],
    accent: "border-emerald-400",
    iconBg: "bg-emerald-50",
    tagBg: "bg-emerald-50 text-emerald-600",
    btnClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    type: "link" as const,
    href: "/resume/new?format=no_photo",
    emoji: "🌐",
    label: "写真なし履歴書",
    sub: "Web応募・郵送不要の場合に対応",
    tags: ["Web応募", "写真不要"],
    accent: "border-slate-400",
    iconBg: "bg-slate-50",
    tagBg: "bg-slate-100 text-slate-600",
    btnClass: "bg-slate-600 hover:bg-slate-700",
  },
  {
    type: "disabled" as const,
    emoji: "📋",
    label: "職務経歴書",
    sub: "職務要約・経歴・スキルを整理",
    tags: ["近日公開"],
    accent: "border-slate-200",
    iconBg: "bg-slate-50",
    tagBg: "bg-amber-50 text-amber-600",
    btnClass: "",
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
          <div className="max-w-xl mx-auto space-y-3">
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
            <p className="text-slate-500 text-sm">全テンプレート無料・登録不要。あとから変更もできます。</p>
          </div>
          {/* キャラクター */}
          <div className="flex justify-center mt-4">
            <OwlCharacter variant="workshop" height={120} />
          </div>
      </section>

      {/* ── テンプレートグリッド ── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => {
            const isDisabled = t.type === "disabled";

            const cardInner = (
              <div className="flex flex-col h-full">
                {/* アイコン */}
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4", t.iconBg)}>
                  {t.emoji}
                </div>

                {/* タイトル・説明 */}
                <p className={cn("font-bold text-base mb-1", isDisabled ? "text-slate-400" : "text-slate-900")}>
                  {t.label}
                </p>
                <p className="text-sm text-slate-500 mb-3 leading-relaxed">{t.sub}</p>

                {/* タグ */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {t.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn("text-xs font-medium px-2 py-0.5 rounded-full", t.tagBg)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* ボタン */}
                <div className="mt-auto">
                  {isDisabled ? (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold text-center">
                      近日公開
                    </div>
                  ) : (
                    <div className={cn(
                      "w-full py-2.5 rounded-xl text-white text-sm font-bold text-center flex items-center justify-center gap-1.5 transition-all",
                      t.btnClass
                    )}>
                      この書類で作る
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );

            return isDisabled ? (
              <div
                key={t.label}
                className={cn(
                  "relative flex flex-col bg-white rounded-2xl border-2 p-5 opacity-50",
                  t.accent
                )}
              >
                {cardInner}
              </div>
            ) : (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "group relative flex flex-col bg-white rounded-2xl border-2 p-5 transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  t.accent
                )}
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
