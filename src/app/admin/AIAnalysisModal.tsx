"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Copy, Check, Sparkles, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAnalysisModal({ isOpen, onClose }: Props) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startAnalysis = useCallback(async () => {
    setContent("");
    setError(null);
    setIsStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/admin/ai-analysis", {
        method: "POST",
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            setIsStreaming(false);
            return;
          }
          try {
            const parsed = JSON.parse(raw) as { text?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              setContent((prev) => prev + parsed.text);
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startAnalysis();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [isOpen, startAnalysis]);

  // Auto-scroll while streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Simple markdown → HTML conversion (headers, bold, lists)
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key++} className="list-disc list-inside space-y-1 my-2 text-slate-700">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: applyInline(item) }}
              />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const applyInline = (s: string) =>
      s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    for (const line of lines) {
      if (/^## (.+)/.test(line)) {
        flushList();
        elements.push(
          <h2 key={key++} className="text-base font-bold text-slate-900 mt-5 mb-2 border-b border-slate-200 pb-1">
            {line.replace(/^## /, "")}
          </h2>
        );
      } else if (/^### (.+)/.test(line)) {
        flushList();
        elements.push(
          <h3 key={key++} className="text-sm font-bold text-slate-800 mt-3 mb-1">
            {line.replace(/^### /, "")}
          </h3>
        );
      } else if (/^# (.+)/.test(line)) {
        flushList();
        elements.push(
          <h1 key={key++} className="text-lg font-black text-slate-900 mt-2 mb-3">
            {line.replace(/^# /, "")}
          </h1>
        );
      } else if (/^[-*] (.+)/.test(line)) {
        inList = true;
        listItems.push(line.replace(/^[-*] /, ""));
      } else if (line.trim() === "") {
        flushList();
        elements.push(<div key={key++} className="h-1" />);
      } else {
        flushList();
        elements.push(
          <p key={key++} className="text-sm text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: applyInline(line) }}
          />
        );
      }
    }
    flushList();
    return elements;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">AI 現状分析レポート</h2>
            <p className="text-xs text-slate-400">
              {isStreaming ? "分析中..." : error ? "エラーが発生しました" : "分析完了"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {content && !isStreaming && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "コピー完了" : "コピー"}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">エラーが発生しました</p>
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={startAnalysis}
                className="mt-3 text-xs font-semibold text-red-700 underline hover:no-underline"
              >
                再試行する
              </button>
            </div>
          ) : content ? (
            <div className="prose-sm">
              {renderMarkdown(content)}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-500">データを収集してAIが分析しています...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isStreaming && !error && content && (
          <div className="px-6 py-3 border-t border-slate-100 shrink-0">
            <p className="text-xs text-slate-400 text-center">
              このレポートはAIが生成したものです。重要な意思決定には実データを合わせてご確認ください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
