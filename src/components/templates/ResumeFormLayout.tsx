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
import { Download, Eye, FileText, ChevronLeft } from "lucide-react";
import type { ResumeFormat } from "@/types";

interface ResumeFormLayoutProps {
  format?: ResumeFormat;
  resumeId?: string;
}

/**
 * 履歴書フォーム全体を構成するテンプレート。
 * PDF ダウンロード・プレビューモーダルをここで制御する。
 */
export function ResumeFormLayout({
  format = "jis",
  resumeId,
}: ResumeFormLayoutProps) {
  const initNew = useResumeStore((s) => s.initNew);
  const current = useResumeStore((s) => s.current);
  const saved = useResumeStore((s) => s.saved);
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
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* スティッキーヘッダー */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
          <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                TOP
              </Link>
              <span className="text-slate-200 select-none">|</span>
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <h1 className="font-semibold text-sm sm:text-base truncate">
                  {current.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator className="hidden sm:flex" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewing(true)}
                className="gap-1.5"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">プレビュー</span>
              </Button>
              <Button
                size="sm"
                onClick={download}
                isLoading={isGenerating}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDFダウンロード</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </header>

        {/* フォーム本体 */}
        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-10">
          <PersonalInfoSection />
          <EducationSection />
          <WorkHistorySection />
          <LicenseSection />
          <MotivationSection />

          {/* フッターアクション */}
          <div className="flex items-center justify-between pt-4 border-t">
            <AutoSaveIndicator className="sm:hidden" />
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={() => setIsPreviewing(true)}>
                <Eye className="h-4 w-4 mr-2" />
                プレビュー
              </Button>
              <Button onClick={download} isLoading={isGenerating}>
                <Download className="h-4 w-4 mr-2" />
                PDFダウンロード
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* PDF プレビューモーダル */}
      <PdfPreviewModal
        resume={current}
        isOpen={isPreviewing}
        onClose={() => setIsPreviewing(false)}
      />
    </>
  );
}
