"use client";

import { useEffect, useRef } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import type { EducationEntryType, EducationExitType, ResumeFormat } from "@/types";

const ENTRY_OPTIONS: { value: EducationEntryType; label: string }[] = [
  { value: "enrolled",       label: "入学" },
  { value: "transferred_in", label: "転入" },
];
const EXIT_OPTIONS: { value: EducationExitType; label: string }[] = [
  { value: "graduated",    label: "卒業" },
  { value: "transferred",  label: "転学" },
  { value: "study_abroad", label: "留学" },
  { value: "dropped_out",  label: "中退" },
];

const FORMAT_EDU_HINTS: Partial<Record<ResumeFormat, string>> = {
  career_change: "最終学歴を中心に記載してください。古い学歴は省略しても構いません。",
  new_graduate:  "小学校・中学校・高校・大学まで記載してください。部活やゼミ活動は後のステップで入力できます。",
  part_time:     "在学中の方は「卒業見込み」として記載してください。",
};

export function EducationSection({ className, format = "jis" }: { className?: string; format?: ResumeFormat }) {
  const education        = useResumeStore((s) => s.current?.education ?? []);
  const birthDate        = useResumeStore((s) => s.current?.personalInfo.birthDate ?? "");
  const addEducation     = useResumeStore((s) => s.addEducation);
  const updateEducation  = useResumeStore((s) => s.updateEducation);
  const removeEducation  = useResumeStore((s) => s.removeEducation);
  const initFromBirth    = useResumeStore((s) => s.initEducationFromBirthDate);
  const autoFilled       = useRef(false);

  // 生年月日が設定されたら小中高を自動入力（空の場合のみ）
  useEffect(() => {
    if (birthDate && !autoFilled.current) {
      autoFilled.current = true;
      initFromBirth(birthDate);
    }
  }, [birthDate, initFromBirth]);

  const handleExitTypeChange = (id: string, exitType: EducationExitType) => {
    const entry = education.find((e) => e.id === id);
    if (!entry) return;
    updateEducation(id, { exitType });
    // 転学の場合は次のエントリを自動追加
    if (exitType === "transferred") {
      addEducation({
        entryType: "transferred_in",
        entryYear: entry.exitYear ?? entry.entryYear,
        entryMonth: entry.exitMonth ?? entry.entryMonth,
      });
    }
  };

  const hint = FORMAT_EDU_HINTS[format];

  return (
    <section className={cn("space-y-4", className)} aria-labelledby="education-heading">
      <h2 id="education-heading" className="text-lg font-semibold border-b pb-2">学歴</h2>

      {hint && (
        <p className="text-sm text-indigo-700 bg-indigo-50 rounded-xl px-4 py-2.5 border border-indigo-100">
          {hint}
        </p>
      )}

      <ol className="space-y-4">
        {education.map((entry, index) => (
          <li key={entry.id} className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/50">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                学歴 {index + 1}
              </span>
              {education.length > 1 && (
                <button onClick={() => removeEducation(entry.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 学校名・学部 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField id={`edu-school-${entry.id}`} label="学校名" required>
                <Input
                  id={`edu-school-${entry.id}`}
                  value={entry.school}
                  onChange={(e) => updateEducation(entry.id, { school: e.target.value })}
                  placeholder="〇〇高等学校"
                />
              </FormField>
              <FormField id={`edu-faculty-${entry.id}`} label="学部・学科">
                <Input
                  id={`edu-faculty-${entry.id}`}
                  value={entry.faculty ?? ""}
                  onChange={(e) => updateEducation(entry.id, { faculty: e.target.value })}
                  placeholder="経済学部 経済学科（大学の場合）"
                />
              </FormField>
            </div>

            {/* 入学情報 */}
            <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500">入学</p>
              <div className="flex flex-wrap items-center gap-3">
                <YearMonthSelector
                  year={entry.entryYear}
                  month={entry.entryMonth}
                  onYearChange={(y) => updateEducation(entry.id, { entryYear: y })}
                  onMonthChange={(m) => updateEducation(entry.id, { entryMonth: m })}
                />
                <Select
                  value={entry.entryType}
                  onValueChange={(v) => updateEducation(entry.id, { entryType: v as EducationEntryType })}
                >
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENTRY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 卒業情報 */}
            <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500">卒業 / 修了</p>
              <div className="flex flex-wrap items-center gap-3">
                <YearMonthSelector
                  year={entry.exitYear ?? entry.entryYear}
                  month={entry.exitMonth ?? entry.entryMonth}
                  onYearChange={(y) => updateEducation(entry.id, { exitYear: y })}
                  onMonthChange={(m) => updateEducation(entry.id, { exitMonth: m })}
                />
                <Select
                  value={entry.exitType ?? "graduated"}
                  onValueChange={(v) => handleExitTypeChange(entry.id, v as EducationExitType)}
                >
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXIT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* 追加ボタン */}
      <button
        onClick={() => addEducation()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
      >
        <PlusCircle className="h-4 w-4" />
        学歴を追加
      </button>
    </section>
  );
}
