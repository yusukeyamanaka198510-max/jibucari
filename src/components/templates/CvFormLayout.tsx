"use client";

import { useEffect, useRef, useState, createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { useCvStore } from "@/store/cvStore";
import { SaveIndicator } from "@/components/molecules/SaveIndicator";
import { Button } from "@/components/atoms/Button";
import { CvPdfDocument } from "@/components/pdf/CvPdfDocument";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Download, Plus, Trash2, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CvWorkEntry, CvSkillEntry } from "@/types/cv";
import { ProfileSyncBar } from "@/components/molecules/ProfileSyncBar";
import { useProfileStore } from "@/store/profileStore";

const STEPS = [
  { id: 1, label: "基本情報",   short: "基本" },
  { id: 2, label: "職務概要",   short: "概要" },
  { id: 3, label: "職務経歴",   short: "経歴" },
  { id: 4, label: "保有スキル", short: "スキル" },
  { id: 5, label: "自己PR",     short: "PR" },
  { id: 6, label: "確認・DL",   short: "確認" },
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1";

export function CvFormLayout() {
  const initNew          = useCvStore((s) => s.initNew);
  const current          = useCvStore((s) => s.current);
  const saveCurrentToList = useCvStore((s) => s.saveCurrentToList);
  const setAutoSaveStatus = useCvStore((s) => s.setAutoSaveStatus);
  const autoSaveStatus   = useCvStore((s) => s.autoSaveStatus);
  const [step, setStep]  = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { initNew(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 自動保存
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
      const el = createElement(CvPdfDocument, { cv: current }) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await (pdf as any)(el).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${current.title}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setIsGenerating(false); }
  };

  const { saveProfile, profile: savedProfile } = useProfileStore();

  const handleSaveProfile = async (userId: string) => {
    if (!current) return;
    await saveProfile(userId, {
      lastName: current.lastName,
      firstName: current.firstName,
      lastNameKana: current.lastNameKana,
      firstNameKana: current.firstNameKana,
      birthDate: current.birthDate,
      gender: "",
      postalCode: "",
      prefecture: "",
      city: "",
      addressDetail: current.address,
      phone: current.mobilePhone,
      email: current.email,
    });
  };

  const handlePasteProfile = () => {
    if (!savedProfile) return;
    const update = useCvStore.getState().updateField;
    update({
      lastName: savedProfile.lastName,
      firstName: savedProfile.firstName,
      lastNameKana: savedProfile.lastNameKana,
      firstNameKana: savedProfile.firstNameKana,
      birthDate: savedProfile.birthDate,
      address: [savedProfile.prefecture, savedProfile.city, savedProfile.addressDetail].filter(Boolean).join(""),
      mobilePhone: savedProfile.phone,
      email: savedProfile.email,
    });
  };

  if (!current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
              トップ
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm text-slate-700">職務経歴書</span>
          </div>
          <SaveIndicator status={autoSaveStatus} className="hidden sm:flex" />
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                      isDone ? "bg-violet-600 text-white" : isActive ? "bg-violet-600 text-white ring-4 ring-violet-100" : "bg-slate-100 text-slate-400"
                    )}>
                      {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                    </span>
                    <span className={cn("text-[10px] sm:text-xs font-medium truncate w-full text-center",
                      isActive ? "text-violet-600" : isDone ? "text-slate-500" : "text-slate-400"
                    )}>
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">{s.short}</span>
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn("h-px flex-shrink-0 w-3 sm:w-6 mx-0.5 transition-colors", step > s.id ? "bg-violet-400" : "bg-slate-200")} />
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
            <p className="text-xs text-violet-600 font-semibold tracking-widest uppercase mb-1">Step {step} / {STEPS.length}</p>
            <h2 className="text-xl font-black text-slate-900">{STEPS[step - 1]?.label}</h2>
          </div>
          <div className="space-y-5">
            {step === 1 && (
              <>
                <ProfileSyncBar onSave={handleSaveProfile} onPaste={handlePasteProfile} />
                <BasicInfoStep />
              </>
            )}
            {step === 2 && <SummaryStep />}
            {step === 3 && <WorkHistoryStep />}
            {step === 4 && <SkillsStep />}
            {step === 5 && <SelfPRStep />}
            {step === 6 && <ReviewStep onDownload={handleDownload} isGenerating={isGenerating} />}
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="gap-2">
            <ChevronLeft className="h-4 w-4" />前へ
          </Button>
          <SaveIndicator status={autoSaveStatus} className="sm:hidden" />
          {step < STEPS.length ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} className="gap-2 bg-violet-600 hover:bg-violet-700">
              次へ<ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleDownload} isLoading={isGenerating} className="gap-2 bg-violet-600 hover:bg-violet-700">
              <Download className="h-4 w-4" />PDFダウンロード
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Step 1: 基本情報 ── */
function BasicInfoStep() {
  const current = useCvStore((s) => s.current)!;
  const update  = useCvStore((s) => s.updateField);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>姓</label><input className={inputCls} value={current.lastName} onChange={(e) => update({ lastName: e.target.value })} placeholder="山田" /></div>
        <div><label className={labelCls}>名</label><input className={inputCls} value={current.firstName} onChange={(e) => update({ firstName: e.target.value })} placeholder="太郎" /></div>
        <div><label className={labelCls}>姓（フリガナ）</label><input className={inputCls} value={current.lastNameKana} onChange={(e) => update({ lastNameKana: e.target.value })} placeholder="ヤマダ" /></div>
        <div><label className={labelCls}>名（フリガナ）</label><input className={inputCls} value={current.firstNameKana} onChange={(e) => update({ firstNameKana: e.target.value })} placeholder="タロウ" /></div>
      </div>
      <div><label className={labelCls}>生年月日</label><input type="date" className={inputCls} value={current.birthDate} onChange={(e) => update({ birthDate: e.target.value })} /></div>
      <div><label className={labelCls}>住所</label><input className={inputCls} value={current.address} onChange={(e) => update({ address: e.target.value })} placeholder="東京都渋谷区..." /></div>
      <div><label className={labelCls}>電話番号</label><input className={inputCls} value={current.mobilePhone} onChange={(e) => update({ mobilePhone: e.target.value })} placeholder="090-0000-0000" /></div>
      <div><label className={labelCls}>メールアドレス</label><input type="email" className={inputCls} value={current.email} onChange={(e) => update({ email: e.target.value })} placeholder="example@mail.com" /></div>
    </div>
  );
}

/* ── Step 2: 職務概要 ── */
function SummaryStep() {
  const summary = useCvStore((s) => s.current?.summary ?? "");
  const update  = useCvStore((s) => s.updateField);
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">これまでのキャリアの全体像を3〜5文で簡潔に書きましょう。</p>
      <textarea
        className={cn(inputCls, "min-h-[160px] resize-y")}
        value={summary}
        onChange={(e) => update({ summary: e.target.value })}
        placeholder="例：Webエンジニアとして5年間、フロントエンドからバックエンドまで幅広く経験。React・TypeScriptを用いたSPA開発を中心に、チームリーダーとして3名のメンバーをマネジメント。..."
      />
    </div>
  );
}

/* ── Step 3: 職務経歴 ── */
function WorkHistoryStep() {
  const entries  = useCvStore((s) => s.current?.workHistory ?? []);
  const addWork  = useCvStore((s) => s.addWork);
  const update   = useCvStore((s) => s.updateWork);
  const remove   = useCvStore((s) => s.removeWork);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">直近の職歴から順に入力してください。</p>
      {entries.map((w, i) => (
        <WorkEntryCard key={w.id} entry={w} index={i} onUpdate={update} onRemove={() => remove(w.id)} />
      ))}
      <button
        onClick={addWork}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />職歴を追加
      </button>
    </div>
  );
}

function WorkEntryCard({ entry, index, onUpdate, onRemove }: {
  entry: CvWorkEntry; index: number;
  onUpdate: (id: string, patch: Partial<CvWorkEntry>) => void;
  onRemove: () => void;
}) {
  const up = (patch: Partial<CvWorkEntry>) => onUpdate(entry.id, patch);
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-violet-600">職歴 {index + 1}</span>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div><label className={labelCls}>会社名 <span className="text-red-500">*</span></label>
        <input className={inputCls} value={entry.company} onChange={(e) => up({ company: e.target.value })} placeholder="株式会社〇〇" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>業種</label>
          <input className={inputCls} value={entry.industry ?? ""} onChange={(e) => up({ industry: e.target.value })} placeholder="IT・通信" />
        </div>
        <div><label className={labelCls}>規模</label>
          <input className={inputCls} value={entry.scale ?? ""} onChange={(e) => up({ scale: e.target.value })} placeholder="従業員500名" />
        </div>
        <div><label className={labelCls}>部署</label>
          <input className={inputCls} value={entry.department ?? ""} onChange={(e) => up({ department: e.target.value })} placeholder="開発部" />
        </div>
        <div><label className={labelCls}>役職</label>
          <input className={inputCls} value={entry.position ?? ""} onChange={(e) => up({ position: e.target.value })} placeholder="エンジニア" />
        </div>
      </div>
      {/* 在籍期間 */}
      <div>
        <label className={labelCls}>在籍期間</label>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" value={entry.entryYear} onChange={(e) => up({ entryYear: Number(e.target.value) })}>
            {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" value={entry.entryMonth} onChange={(e) => up({ entryMonth: Number(e.target.value) })}>
            {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
          </select>
          <span className="text-slate-500 text-sm">〜</span>
          {!entry.isCurrent && (
            <>
              <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" value={entry.exitYear ?? ""} onChange={(e) => up({ exitYear: Number(e.target.value) })}>
                <option value="">年</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
              <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" value={entry.exitMonth ?? ""} onChange={(e) => up({ exitMonth: Number(e.target.value) })}>
                <option value="">月</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
            </>
          )}
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={entry.isCurrent} onChange={(e) => up({ isCurrent: e.target.checked, exitYear: undefined, exitMonth: undefined })} className="rounded" />
            現在も在籍
          </label>
        </div>
      </div>
      <div><label className={labelCls}>業務内容</label>
        <textarea className={cn(inputCls, "min-h-[100px] resize-y")} value={entry.description} onChange={(e) => up({ description: e.target.value })} placeholder="担当した業務の内容を具体的に記載してください。" />
      </div>
      <div><label className={labelCls}>実績・成果</label>
        <textarea className={cn(inputCls, "min-h-[80px] resize-y")} value={entry.achievements ?? ""} onChange={(e) => up({ achievements: e.target.value })} placeholder="売上〇%向上、リードタイムを△%削減 など" />
      </div>
    </div>
  );
}

/* ── Step 4: 保有スキル ── */
function SkillsStep() {
  const entries  = useCvStore((s) => s.current?.skills ?? []);
  const addSkill = useCvStore((s) => s.addSkill);
  const update   = useCvStore((s) => s.updateSkill);
  const remove   = useCvStore((s) => s.removeSkill);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">カテゴリ別に保有スキルを入力してください。</p>
      {entries.map((sk) => (
        <SkillEntryCard key={sk.id} entry={sk} onUpdate={update} onRemove={() => remove(sk.id)} />
      ))}
      <button
        onClick={addSkill}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />スキルカテゴリを追加
      </button>
    </div>
  );
}

function SkillEntryCard({ entry, onUpdate, onRemove }: {
  entry: CvSkillEntry;
  onUpdate: (id: string, patch: Partial<CvSkillEntry>) => void;
  onRemove: () => void;
}) {
  const up = (patch: Partial<CvSkillEntry>) => onUpdate(entry.id, patch);
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <label className={labelCls}>カテゴリ</label>
          <input className={inputCls} value={entry.category} onChange={(e) => up({ category: e.target.value })} placeholder="例：言語、フレームワーク、DB、ツール..." />
        </div>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors mt-5">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div>
        <label className={labelCls}>スキル一覧</label>
        <input className={inputCls} value={entry.items} onChange={(e) => up({ items: e.target.value })} placeholder="例：Java, Python, Go, TypeScript" />
      </div>
    </div>
  );
}

/* ── Step 5: 自己PR ── */
function SelfPRStep() {
  const selfPR = useCvStore((s) => s.current?.selfPR ?? "");
  const update = useCvStore((s) => s.updateField);
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">強み・スキル・意欲を具体的なエピソードを交えて記載しましょう。</p>
      <textarea
        className={cn(inputCls, "min-h-[200px] resize-y")}
        value={selfPR}
        onChange={(e) => update({ selfPR: e.target.value })}
        placeholder="例：課題解決に向けた主体的な行動を得意としています。前職では..."
      />
    </div>
  );
}

/* ── Step 6: 確認・DL ── */
function ReviewStep({ onDownload, isGenerating }: { onDownload: () => void; isGenerating: boolean }) {
  const current = useCvStore((s) => s.current)!;
  return (
    <div className="space-y-6 py-2">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-black text-slate-900">入力完了！</h3>
        <p className="text-slate-500 text-sm">内容を確認してPDFをダウンロードしましょう。</p>
      </div>

      {/* サマリー */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
        <p><span className="font-semibold text-slate-700">氏名：</span>{current.lastName} {current.firstName}</p>
        <p><span className="font-semibold text-slate-700">職歴数：</span>{current.workHistory.length}件</p>
        <p><span className="font-semibold text-slate-700">スキルカテゴリ数：</span>{current.skills.length}件</p>
      </div>

      <Button onClick={onDownload} isLoading={isGenerating} className="w-full gap-2 bg-violet-600 hover:bg-violet-700 py-4 text-base">
        <Download className="h-5 w-5" />PDFをダウンロード
      </Button>
      <p className="text-xs text-slate-400 text-center">ダウンロード後も編集・再ダウンロードできます</p>
    </div>
  );
}
