"use client";

import { useEffect, useRef, useState, createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { useCoverLetterStore } from "@/store/coverLetterStore";
import { SaveIndicator } from "@/components/molecules/SaveIndicator";
import { Button } from "@/components/atoms/Button";
import { CoverLetterPdfDocument } from "@/components/pdf/CoverLetterPdfDocument";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnclosureItem } from "@/types/coverLetter";

const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1";

function buildSteps(type: string) {
  const base = [{ id: 1, label: "種類・日付", short: "種類" }, { id: 2, label: "差出人", short: "差出人" }];
  if (type === "resignation") {
    base.push({ id: 3, label: "退職情報", short: "退職" });
  } else {
    base.push({ id: 3, label: "送付先", short: "送付先" }, { id: 4, label: "書類・文面", short: "書類" });
  }
  base.push({ id: base.length + 1, label: "確認・DL", short: "確認" });
  return base;
}

export function CoverLetterFormLayout() {
  const initNew           = useCoverLetterStore((s) => s.initNew);
  const current           = useCoverLetterStore((s) => s.current);
  const saveCurrentToList = useCoverLetterStore((s) => s.saveCurrentToList);
  const setAutoSaveStatus = useCoverLetterStore((s) => s.setAutoSaveStatus);
  const autoSaveStatus    = useCoverLetterStore((s) => s.autoSaveStatus);
  const [step, setStep]   = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { initNew(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      try { saveCurrentToList(); setAutoSaveStatus("saved"); }
      catch { setAutoSaveStatus("error"); }
    }, 1500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, saveCurrentToList, setAutoSaveStatus]);

  const handleDownload = async () => {
    if (!current) return;
    setIsGenerating(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const el = createElement(CoverLetterPdfDocument, { cl: current }) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await (pdf as any)(el).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${current.title}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setIsGenerating(false); }
  };

  if (!current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const STEPS = buildSteps(current.type);
  const lastStep = STEPS[STEPS.length - 1].id;
  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-600 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />トップ
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm text-slate-700">
              {current.type === "resignation" ? "退職届" : "送付状"}
            </span>
          </div>
          <SaveIndicator status={autoSaveStatus} className="hidden sm:flex" />
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* ステップインジケーター */}
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
                    className={cn("flex flex-col items-center gap-0.5 flex-1 min-w-0 transition-opacity", isDone ? "cursor-pointer" : "cursor-default")}
                  >
                    <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      isDone ? "bg-sky-600 text-white" : isActive ? "bg-sky-600 text-white ring-4 ring-sky-100" : "bg-slate-100 text-slate-400"
                    )}>
                      {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                    </span>
                    <span className={cn("text-[10px] sm:text-xs font-medium truncate w-full text-center",
                      isActive ? "text-sky-600" : isDone ? "text-slate-500" : "text-slate-400"
                    )}>
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">{s.short}</span>
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn("h-px flex-shrink-0 w-3 sm:w-6 mx-0.5 transition-colors", step > s.id ? "bg-sky-400" : "bg-slate-200")} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* フォーム本体 */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs text-sky-600 font-semibold tracking-widest uppercase mb-1">Step {step} / {STEPS.length}</p>
            <h2 className="text-xl font-black text-slate-900">{STEPS[step - 1]?.label}</h2>
          </div>
          <div className="space-y-5">
            {step === 1 && <TypeDateStep />}
            {step === 2 && <SenderStep />}
            {step === 3 && current.type === "resignation" && <ResignationStep />}
            {step === 3 && current.type !== "resignation" && <RecipientStep />}
            {step === 4 && current.type !== "resignation" && <EnclosureMessageStep />}
            {step === lastStep && <ReviewStep onDownload={handleDownload} isGenerating={isGenerating} />}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="gap-2">
            <ChevronLeft className="h-4 w-4" />前へ
          </Button>
          <SaveIndicator status={autoSaveStatus} className="sm:hidden" />
          {step < STEPS.length ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} className="gap-2 bg-sky-600 hover:bg-sky-700">
              次へ<ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleDownload} isLoading={isGenerating} className="gap-2 bg-sky-600 hover:bg-sky-700">
              <Download className="h-4 w-4" />PDFダウンロード
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Step 1: 種類・日付 ── */
function TypeDateStep() {
  const current = useCoverLetterStore((s) => s.current)!;
  const update  = useCoverLetterStore((s) => s.updateField);
  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>書類の種類</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: "cover_letter", label: "📬 送付状", sub: "応募書類の送付時" },
            { value: "resignation",  label: "📝 退職届", sub: "退職を申し出る際" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({
                type: opt.value as "cover_letter" | "resignation",
                title: opt.value === "resignation" ? "退職届" : "送付状",
              })}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                current.type === opt.value
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <p className="font-bold text-slate-800">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-1">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>日付</label>
        <input type="date" className={inputCls} value={current.date} onChange={(e) => update({ date: e.target.value })} />
      </div>
    </div>
  );
}

/* ── Step 2: 差出人 ── */
function SenderStep() {
  const current = useCoverLetterStore((s) => s.current)!;
  const update  = useCoverLetterStore((s) => s.updateField);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>姓</label><input className={inputCls} value={current.yourLastName} onChange={(e) => update({ yourLastName: e.target.value })} placeholder="山田" /></div>
        <div><label className={labelCls}>名</label><input className={inputCls} value={current.yourFirstName} onChange={(e) => update({ yourFirstName: e.target.value })} placeholder="太郎" /></div>
      </div>
      <div><label className={labelCls}>住所</label><input className={inputCls} value={current.yourAddress} onChange={(e) => update({ yourAddress: e.target.value })} placeholder="東京都渋谷区..." /></div>
      <div><label className={labelCls}>電話番号</label><input className={inputCls} value={current.yourPhone} onChange={(e) => update({ yourPhone: e.target.value })} placeholder="090-0000-0000" /></div>
      <div><label className={labelCls}>メールアドレス</label><input type="email" className={inputCls} value={current.yourEmail} onChange={(e) => update({ yourEmail: e.target.value })} placeholder="example@mail.com" /></div>
      {current.type === "resignation" && (
        <div><label className={labelCls}>所属部署</label><input className={inputCls} value={current.yourCompanyDepartment} onChange={(e) => update({ yourCompanyDepartment: e.target.value })} placeholder="開発部" /></div>
      )}
    </div>
  );
}

/* ── Step 3 (送付状): 送付先 ── */
function RecipientStep() {
  const current = useCoverLetterStore((s) => s.current)!;
  const update  = useCoverLetterStore((s) => s.updateField);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>会社名</label><input className={inputCls} value={current.recipientCompany} onChange={(e) => update({ recipientCompany: e.target.value })} placeholder="株式会社〇〇" /></div>
      <div><label className={labelCls}>部署名</label><input className={inputCls} value={current.recipientDepartment} onChange={(e) => update({ recipientDepartment: e.target.value })} placeholder="人事部（省略可）" /></div>
      <div><label className={labelCls}>担当者名</label><input className={inputCls} value={current.recipientName} onChange={(e) => update({ recipientName: e.target.value })} placeholder="省略する場合は空欄" /></div>
    </div>
  );
}

/* ── Step 3 (退職届): 退職情報 ── */
function ResignationStep() {
  const current = useCoverLetterStore((s) => s.current)!;
  const update  = useCoverLetterStore((s) => s.updateField);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>会社名</label><input className={inputCls} value={current.companyName} onChange={(e) => update({ companyName: e.target.value })} placeholder="株式会社〇〇" /></div>
      <div><label className={labelCls}>退職日</label><input type="date" className={inputCls} value={current.resignationDate} onChange={(e) => update({ resignationDate: e.target.value })} /></div>
      <div>
        <label className={labelCls}>退職理由</label>
        <input className={inputCls} value={current.reason} onChange={(e) => update({ reason: e.target.value })} placeholder="一身上の都合により" />
        <p className="text-xs text-slate-400 mt-1">通常は「一身上の都合により」のままで問題ありません</p>
      </div>
    </div>
  );
}

/* ── Step 4 (送付状): 同封書類・文面 ── */
function EnclosureMessageStep() {
  const current         = useCoverLetterStore((s) => s.current)!;
  const update          = useCoverLetterStore((s) => s.updateField);
  const addEnclosure    = useCoverLetterStore((s) => s.addEnclosure);
  const updateEnclosure = useCoverLetterStore((s) => s.updateEnclosure);
  const removeEnclosure = useCoverLetterStore((s) => s.removeEnclosure);

  return (
    <div className="space-y-5">
      {/* 同封書類 */}
      <div>
        <label className={labelCls}>同封書類</label>
        <div className="space-y-2 mt-2">
          {current.enclosures.map((enc: EnclosureItem) => (
            <div key={enc.id} className="flex items-center gap-2">
              <input
                className={cn(inputCls, "flex-1")}
                value={enc.name}
                onChange={(e) => updateEnclosure(enc.id, { name: e.target.value })}
                placeholder="書類名"
              />
              <select
                className="rounded-xl border border-slate-300 px-2 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={enc.count}
                onChange={(e) => updateEnclosure(enc.id, { count: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}部</option>)}
              </select>
              <button onClick={() => removeEnclosure(enc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addEnclosure}
            className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium mt-1"
          >
            <Plus className="h-4 w-4" />書類を追加
          </button>
        </div>
      </div>
      {/* 本文 */}
      <div>
        <label className={labelCls}>本文メッセージ</label>
        <textarea
          className={cn(inputCls, "min-h-[160px] resize-y")}
          value={current.message}
          onChange={(e) => update({ message: e.target.value })}
        />
      </div>
    </div>
  );
}

/* ── 確認・DL ── */
function ReviewStep({ onDownload, isGenerating }: { onDownload: () => void; isGenerating: boolean }) {
  const current = useCoverLetterStore((s) => s.current)!;
  return (
    <div className="space-y-6 py-2">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-black text-slate-900">入力完了！</h3>
        <p className="text-slate-500 text-sm">PDFをダウンロードして印刷・送付しましょう。</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
        <p><span className="font-semibold text-slate-700">書類種類：</span>{current.type === "resignation" ? "退職届" : "送付状"}</p>
        <p><span className="font-semibold text-slate-700">差出人：</span>{current.yourLastName} {current.yourFirstName}</p>
        {current.type !== "resignation" && (
          <p><span className="font-semibold text-slate-700">同封書類：</span>{current.enclosures.length}件</p>
        )}
      </div>
      <Button onClick={onDownload} isLoading={isGenerating} className="w-full gap-2 bg-sky-600 hover:bg-sky-700 py-4 text-base">
        <Download className="h-5 w-5" />PDFをダウンロード
      </Button>
      <p className="text-xs text-slate-400 text-center">ダウンロード後も編集・再ダウンロードできます</p>
    </div>
  );
}
