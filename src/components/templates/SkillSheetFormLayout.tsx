"use client";

import { useEffect, useRef, useState, createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { useSkillSheetStore } from "@/store/skillSheetStore";
import { SaveIndicator } from "@/components/molecules/SaveIndicator";
import { Button } from "@/components/atoms/Button";
import { SkillSheetPdfDocument } from "@/components/pdf/SkillSheetPdfDocument";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TechSkill, ProjectEntry } from "@/types/skillSheet";

const STEPS = [
  { id: 1, label: "基本情報",         short: "基本" },
  { id: 2, label: "職務概要",         short: "概要" },
  { id: 3, label: "保有スキル",       short: "スキル" },
  { id: 4, label: "プロジェクト経歴", short: "案件" },
  { id: 5, label: "自己PR",           short: "PR" },
  { id: 6, label: "確認・DL",         short: "確認" },
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1";

const CATEGORIES = [
  { value: "language",  label: "言語" },
  { value: "framework", label: "FW/ライブラリ" },
  { value: "database",  label: "DB" },
  { value: "cloud",     label: "クラウド" },
  { value: "tool",      label: "ツール" },
  { value: "other",     label: "その他" },
];

const LEVELS = [
  { value: "beginner",     label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced",     label: "上級" },
  { value: "expert",       label: "エキスパート" },
];

export function SkillSheetFormLayout() {
  const initNew           = useSkillSheetStore((s) => s.initNew);
  const current           = useSkillSheetStore((s) => s.current);
  const saveCurrentToList = useSkillSheetStore((s) => s.saveCurrentToList);
  const setAutoSaveStatus = useSkillSheetStore((s) => s.setAutoSaveStatus);
  const autoSaveStatus    = useSkillSheetStore((s) => s.autoSaveStatus);
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
      const el = createElement(SkillSheetPdfDocument, { ss: current }) as any;
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
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
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
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />トップ
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm text-slate-700">スキルシート</span>
          </div>
          <SaveIndicator status={autoSaveStatus} className="hidden sm:flex" />
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                    className={cn("flex flex-col items-center gap-0.5 flex-1 min-w-0", isDone ? "cursor-pointer" : "cursor-default")}
                  >
                    <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      isDone ? "bg-emerald-600 text-white" : isActive ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-slate-100 text-slate-400"
                    )}>
                      {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                    </span>
                    <span className={cn("text-[10px] sm:text-xs font-medium truncate w-full text-center",
                      isActive ? "text-emerald-600" : isDone ? "text-slate-500" : "text-slate-400"
                    )}>
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">{s.short}</span>
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn("h-px flex-shrink-0 w-3 sm:w-6 mx-0.5 transition-colors", step > s.id ? "bg-emerald-400" : "bg-slate-200")} />
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
            <p className="text-xs text-emerald-600 font-semibold tracking-widest uppercase mb-1">Step {step} / {STEPS.length}</p>
            <h2 className="text-xl font-black text-slate-900">{STEPS[step - 1]?.label}</h2>
          </div>
          <div className="space-y-5">
            {step === 1 && <BasicInfoStep />}
            {step === 2 && <SummaryStep />}
            {step === 3 && <SkillsStep />}
            {step === 4 && <ProjectsStep />}
            {step === 5 && <SelfPRStep />}
            {step === 6 && <ReviewStep onDownload={handleDownload} isGenerating={isGenerating} />}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="gap-2">
            <ChevronLeft className="h-4 w-4" />前へ
          </Button>
          <SaveIndicator status={autoSaveStatus} className="sm:hidden" />
          {step < STEPS.length ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              次へ<ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleDownload} isLoading={isGenerating} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
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
  const current = useSkillSheetStore((s) => s.current)!;
  const update  = useSkillSheetStore((s) => s.updateField);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>姓</label><input className={inputCls} value={current.lastName} onChange={(e) => update({ lastName: e.target.value })} placeholder="山田" /></div>
        <div><label className={labelCls}>名</label><input className={inputCls} value={current.firstName} onChange={(e) => update({ firstName: e.target.value })} placeholder="太郎" /></div>
        <div><label className={labelCls}>姓（フリガナ）</label><input className={inputCls} value={current.lastNameKana} onChange={(e) => update({ lastNameKana: e.target.value })} placeholder="ヤマダ" /></div>
        <div><label className={labelCls}>名（フリガナ）</label><input className={inputCls} value={current.firstNameKana} onChange={(e) => update({ firstNameKana: e.target.value })} placeholder="タロウ" /></div>
      </div>
      <div><label className={labelCls}>生年月日</label><input type="date" className={inputCls} value={current.birthDate} onChange={(e) => update({ birthDate: e.target.value })} /></div>
      <div><label className={labelCls}>最寄駅</label><input className={inputCls} value={current.nearestStation ?? ""} onChange={(e) => update({ nearestStation: e.target.value })} placeholder="渋谷駅（省略可）" /></div>
      <div><label className={labelCls}>メールアドレス</label><input type="email" className={inputCls} value={current.email} onChange={(e) => update({ email: e.target.value })} placeholder="example@mail.com" /></div>
    </div>
  );
}

/* ── Step 2: 職務概要 ── */
function SummaryStep() {
  const summary = useSkillSheetStore((s) => s.current?.summary ?? "");
  const update  = useSkillSheetStore((s) => s.updateField);
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">経験職種・得意領域・実績を3〜5文で記載しましょう。</p>
      <textarea
        className={cn(inputCls, "min-h-[140px] resize-y")}
        value={summary}
        onChange={(e) => update({ summary: e.target.value })}
        placeholder="例：JavaによるWebシステム開発を5年経験。フロントエンドはVue.js/React、バックエンドはSpring Boot/Node.jsが得意。AWSを用いたインフラ設計・運用も経験あり。..."
      />
    </div>
  );
}

/* ── Step 3: 保有スキル ── */
function SkillsStep() {
  const skills    = useSkillSheetStore((s) => s.current?.skills ?? []);
  const addSkill  = useSkillSheetStore((s) => s.addSkill);
  const update    = useSkillSheetStore((s) => s.updateSkill);
  const remove    = useSkillSheetStore((s) => s.removeSkill);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">スキルを1行1スキルで入力してください。</p>
      {skills.length > 0 && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_130px_80px_68px_36px] gap-0 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 px-3 py-2">
            <span>スキル名</span><span>カテゴリ</span><span>経験年数</span><span>レベル</span><span></span>
          </div>
          {skills.map((sk) => (
            <SkillRow key={sk.id} skill={sk} onUpdate={update} onRemove={() => remove(sk.id)} />
          ))}
        </div>
      )}
      <button
        onClick={addSkill}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />スキルを追加
      </button>
    </div>
  );
}

function SkillRow({ skill, onUpdate, onRemove }: {
  skill: TechSkill;
  onUpdate: (id: string, patch: Partial<TechSkill>) => void;
  onRemove: () => void;
}) {
  const up = (patch: Partial<TechSkill>) => onUpdate(skill.id, patch);
  return (
    <div className="grid grid-cols-[1fr_130px_80px_68px_36px] gap-0 border-b border-slate-100 last:border-0 items-center px-3 py-2">
      <input
        className="text-sm border-none outline-none bg-transparent w-full"
        value={skill.name}
        onChange={(e) => up({ name: e.target.value })}
        placeholder="例: Java"
      />
      <select
        className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 mx-1"
        value={skill.category}
        onChange={(e) => up({ category: e.target.value as TechSkill["category"] })}
      >
        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <select
        className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 mx-1"
        value={skill.years}
        onChange={(e) => up({ years: Number(e.target.value) })}
      >
        {Array.from({ length: 20 }, (_, i) => i + 1).map((y) => <option key={y} value={y}>{y}年</option>)}
      </select>
      <select
        className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 mx-1"
        value={skill.level}
        onChange={(e) => up({ level: e.target.value as TechSkill["level"] })}
      >
        {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
      <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors ml-1">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Step 4: プロジェクト経歴 ── */
function ProjectsStep() {
  const projects    = useSkillSheetStore((s) => s.current?.projects ?? []);
  const addProject  = useSkillSheetStore((s) => s.addProject);
  const update      = useSkillSheetStore((s) => s.updateProject);
  const remove      = useSkillSheetStore((s) => s.removeProject);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">直近の案件から順に入力してください。</p>
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} onUpdate={update} onRemove={() => remove(p.id)} />
      ))}
      <button
        onClick={addProject}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />案件を追加
      </button>
    </div>
  );
}

function ProjectCard({ project, index, onUpdate, onRemove }: {
  project: ProjectEntry; index: number;
  onUpdate: (id: string, patch: Partial<ProjectEntry>) => void;
  onRemove: () => void;
}) {
  const up = (patch: Partial<ProjectEntry>) => onUpdate(project.id, patch);
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-600">案件 {index + 1}</span>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div><label className={labelCls}>案件名 <span className="text-red-500">*</span></label>
        <input className={inputCls} value={project.name} onChange={(e) => up({ name: e.target.value })} placeholder="〇〇システム開発" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>クライアント</label>
          <input className={inputCls} value={project.client ?? ""} onChange={(e) => up({ client: e.target.value })} placeholder="〇〇株式会社（省略可）" />
        </div>
        <div><label className={labelCls}>役割</label>
          <input className={inputCls} value={project.role} onChange={(e) => up({ role: e.target.value })} placeholder="SE / PL / PG" />
        </div>
        <div><label className={labelCls}>規模</label>
          <input className={inputCls} value={project.scale ?? ""} onChange={(e) => up({ scale: e.target.value })} placeholder="5名チーム（省略可）" />
        </div>
      </div>
      {/* 期間 */}
      <div>
        <label className={labelCls}>期間</label>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" value={project.startYear} onChange={(e) => up({ startYear: Number(e.target.value) })}>
            {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" value={project.startMonth} onChange={(e) => up({ startMonth: Number(e.target.value) })}>
            {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
          </select>
          <span className="text-slate-500 text-sm">〜</span>
          {!project.isCurrent && (
            <>
              <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" value={project.endYear ?? ""} onChange={(e) => up({ endYear: Number(e.target.value) })}>
                <option value="">年</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
              <select className="rounded-xl border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" value={project.endMonth ?? ""} onChange={(e) => up({ endMonth: Number(e.target.value) })}>
                <option value="">月</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
            </>
          )}
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={project.isCurrent} onChange={(e) => up({ isCurrent: e.target.checked, endYear: undefined, endMonth: undefined })} className="rounded" />
            進行中
          </label>
        </div>
      </div>
      <div><label className={labelCls}>業務内容</label>
        <textarea className={cn(inputCls, "min-h-[90px] resize-y")} value={project.description} onChange={(e) => up({ description: e.target.value })} placeholder="担当した業務を具体的に記載してください。" />
      </div>
      <div><label className={labelCls}>使用技術</label>
        <input className={inputCls} value={project.techStack} onChange={(e) => up({ techStack: e.target.value })} placeholder="Java 11, Spring Boot, MySQL, AWS EC2..." />
      </div>
    </div>
  );
}

/* ── Step 5: 自己PR ── */
function SelfPRStep() {
  const selfPR = useSkillSheetStore((s) => s.current?.selfPR ?? "");
  const update = useSkillSheetStore((s) => s.updateField);
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">技術的な強みや仕事に対する姿勢を記載しましょう。</p>
      <textarea
        className={cn(inputCls, "min-h-[180px] resize-y")}
        value={selfPR}
        onChange={(e) => update({ selfPR: e.target.value })}
        placeholder="例：新技術へのキャッチアップが得意で、業務で必要となったGoを独学で習得し3ヶ月以内に実務投入した実績があります。..."
      />
    </div>
  );
}

/* ── Step 6: 確認・DL ── */
function ReviewStep({ onDownload, isGenerating }: { onDownload: () => void; isGenerating: boolean }) {
  const current = useSkillSheetStore((s) => s.current)!;
  return (
    <div className="space-y-6 py-2">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-black text-slate-900">入力完了！</h3>
        <p className="text-slate-500 text-sm">PDFをダウンロードして送付しましょう。</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
        <p><span className="font-semibold text-slate-700">氏名：</span>{current.lastName} {current.firstName}</p>
        <p><span className="font-semibold text-slate-700">スキル数：</span>{current.skills.length}件</p>
        <p><span className="font-semibold text-slate-700">案件数：</span>{current.projects.length}件</p>
      </div>
      <Button onClick={onDownload} isLoading={isGenerating} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 py-4 text-base">
        <Download className="h-5 w-5" />PDFをダウンロード
      </Button>
      <p className="text-xs text-slate-400 text-center">ダウンロード後も編集・再ダウンロードできます</p>
    </div>
  );
}
