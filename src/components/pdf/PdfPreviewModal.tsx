"use client";

import { useState, lazy, Suspense } from "react";
import { X, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ResumePdfDocument } from "./ResumePdfDocument";
import { Button } from "@/components/atoms/Button";
import type { Resume } from "@/types";

// PDFViewer はブラウザ限定 & 重いので遅延ロード
const PDFViewer = lazy(() =>
  import("@react-pdf/renderer").then((m) => ({ default: m.PDFViewer }))
);

interface PdfPreviewModalProps {
  resume: Resume;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PDF プレビューとダウンロードを提供するモーダル。
 * @react-pdf/renderer の PDFViewer は SSR 非対応のため `"use client"` 必須。
 */
export function PdfPreviewModal({ resume, isOpen, onClose }: PdfPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<ResumePdfDocument resume={resume} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-label="PDF プレビュー"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b px-4 h-14 shrink-0">
        <h2 className="font-semibold">PDF プレビュー</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownload}
            size="sm"
            isLoading={isDownloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            ダウンロード
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* プレビュー本体 */}
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          }
        >
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <ResumePdfDocument resume={resume} />
          </PDFViewer>
        </Suspense>
      </div>
    </div>
  );
}
