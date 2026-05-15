"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ReactElement } from "react";
import { ResumePdfDocument } from "@/components/pdf/ResumePdfDocument";
import type { Resume } from "@/types";

interface UsePdfDownloadReturn {
  download: () => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function usePdfDownload(resume: Resume | null): UsePdfDownloadReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    if (!resume) return;
    setIsGenerating(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = createElement(ResumePdfDocument, { resume }) as ReactElement<any>;
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${resume.title}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return { download, isGenerating, error };
}
