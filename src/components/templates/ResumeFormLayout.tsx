"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { PersonalInfoSection } from "@/components/organisms/PersonalInfoSection";
import { EducationSection } from "@/components/organisms/EducationSection";
import { WorkHistorySection } from "@/components/organisms/WorkHistorySection";
import { LicenseSection } from "@/components/organisms/LicenseSection";
import { MotivationSection } from "@/components/organisms/MotivationSection";
import { AutoSaveIndicator } from "@/components/molecules/AutoSaveIndicator";
import { PdfPreviewModal } from "@/components/pdf/PdfPreviewModal";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeFormat } from "@/types";

interface ResumeFormLayoutProps {
  format?: ResumeFormat;
  resumeId?: string;
}

const FORMAT_LABELS: Record<ResumeFormat, string> = {
  jis: "JIS規格 履歴書",
  career_change: "転職用 履歴書",
  new_graduate: "新卒用 履歴書",
  part_time: "アルバイト用 履歴書",
};

const STEPS = [
  { id: 1, label: "基本情報", short: "基本" },
  { id: 2, label: "学歴",     short: "学歴" },
  { id: 3, label: "職歴",     short: "職歴" },
  { id: 4, label: "免許・資格", short: "資格" },
  { id: 5, label: "志望動機・PR", short: "PR" },
  { id: 6, label: "確認・DL", short: "確認" },
];

export function ResumeFormLayout({ format = "jis", resumeId }: ResumeFormLayoutProps) {
  const initNew = useResumeStore((s) => s.initNew);
  const current = useResumeStore((s) => s.current);
  const saved = useResumeStore((s) => s.saved);
  const [step, setStep] = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const { download, isGenerating } = usePdfDownload(current);

  useEffect(() => {
    if (resumeId) {
      const existing = saved.find((r) => r.id === resumeId);
      if (existing) {
        useResumeStore.getState().loadResume(existing);
        return;
      }
    }
    if (!current) initNew(format);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutoSave();

  if (!current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* ── スティッキーヘッダー ── */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/resume/new"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                テンプレート
              </Link>
              <span className="text-slate-200 select-none">|</span>
              <span className="font-bold text-sm text-slate-700 truncate">
                {FORMAT_LABELS[current.format as ResumeFormat] ?? "履歴書"}
              </span>
            </div>
            <AutoSaveIndicator className="hidden sm:flex" />
          </div>

          {/* プログレスバー */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* ── ステップインジケーター ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-1 sm:gap-2">
              {STEPS.map((s, i) => {
                const isDone = step > s.id;
                const isActive = step === s.id;
                return (
                  <li key={s.id} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => isDone && setStep(s.id)}
                      disabled={!isDone}
                      className={cn(
                        "flex flex-col items-center gap-0.5 flex-1 min-w-0 group transition-opacity",
                        isDone ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <span
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          isDone
                            ? "bg-indigo-600 text-white"
                            : isActive
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                            : "bg-slate-100 text-slate-400"
                        )}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-medium truncate w-full text-center",
                          isActive ? "text-indigo-600" : isDone ? "text-slate-500" : "text-slate-400"
                        )}
                      >
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{s.short}</span>
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-px flex-shrink-0 w-3 sm:w-6 mx-0.5 transition-colors",
                          step > s.id ? "bg-indigo-400" : "bg-slate-200"
                        )}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* ── フォーム本体 ── */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* ステップタイトル */}
            <div className="mb-6">
              <p className="text-xs text-indigo-600 font-semibold tracking-widest uppercase mb-1">
                Step {step} / {STEPS.length}
              </p>
              <h2 className="text-xl font-black text-slate-900">
                {STEPS[step - 1]?.label}
              </h2>
            </div>

            {/* ステップコンテンツ */}
            <div className="space-y-6">
              {step === 1 && <PersonalInfoSection />}
              {step === 2 && <EducationSection />}
              {step === 3 && <WorkHistorySection />}
              {step === 4 && <LicenseSection />}
              {step === 5 && <MotivationSection />}
              {step === 6 && (
                <ReviewStep onPreview={() => setIsPreviewing(true)} onDownload={download} isGenerating={isGenerating} />
              )}
            </div>
          </div>

          {/* ── ナビゲーションボタン ── */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              前へ
            </Button>

            <AutoSaveIndicator className="sm:hidden" />

            {step < STEPS.length ? (
              <Button
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                className="gap-2"
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={download} isLoading={isGenerating} className="gap-2">
                <Download className="h-4 w-4" />
                PDFダウンロード
              </Button>
            )}
          </div>
        </main>
      </div>

      <PdfPreviewModal
        resume={current}
        isOpen={isPreviewing}
        onClose={() => setIsPreviewing(false)}
      />
    </>
  );
}

/* ── Step 6: 確認・ダウンロード ─────────────────────────────────── */
function ReviewStep({
  onPreview,
  onDownload,
  isGenerating,
}: {
  onPreview: () => void;
  onDownload: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="space-y-6 text-center py-4">
      <div className="text-6xl">🎉</div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900">入力完了！</h3>
        <p className="text-slate-500 text-sm">
          内容を確認して、PDFをダウンロードしましょう。
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button variant="outline" onClick={onPreview} className="gap-2">
          <Eye className="h-4 w-4" />
          プレビューで確認
        </Button>
        <Button onClick={onDownload} isLoading={isGenerating} className="gap-2">
          <Download className="h-4 w-4" />
          PDFをダウンロード
        </Button>
      </div>
      <p className="text-xs text-slate-400">
        ダウンロード後も編集・再ダウンロードできます
      </p>
    </div>
  );
}
