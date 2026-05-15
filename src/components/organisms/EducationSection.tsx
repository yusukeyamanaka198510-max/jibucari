"use client";

import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import type { EducationStatus } from "@/types";

const STATUS_OPTIONS: { value: EducationStatus; label: string }[] = [
  { value: "graduated", label: "卒業" },
  { value: "enrolled", label: "在学中" },
  { value: "dropped_out", label: "中退" },
  { value: "transferred", label: "転学" },
];

export function EducationSection({ className }: { className?: string }) {
  const education = useResumeStore((s) => s.current?.education ?? []);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  return (
    <section className={cn("space-y-4", className)} aria-labelledby="education-heading">
      <h2 id="education-heading" className="text-lg font-semibold border-b pb-2">学歴</h2>

      <ol className="space-y-4">
        {education.map((entry, index) => (
          <li key={entry.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">学歴 {index + 1}</span>
              {education.length > 1 && (
                <button
                  onClick={() => removeEducation(entry.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label={`学歴 ${index + 1} を削除`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField id={`edu-school-${entry.id}`} label="学校名" required>
                <Input
                  id={`edu-school-${entry.id}`}
                  value={entry.school}
                  onChange={(e) => updateEducation(entry.id, { school: e.target.value })}
                  placeholder="〇〇大学"
                />
              </FormField>
              <FormField id={`edu-faculty-${entry.id}`} label="学部・学科">
                <Input
                  id={`edu-faculty-${entry.id}`}
                  value={entry.faculty ?? ""}
                  onChange={(e) => updateEducation(entry.id, { faculty: e.target.value })}
                  placeholder="経済学部 経済学科"
                />
              </FormField>
              <FormField id={`edu-year-${entry.id}`} label="年月" required>
                <YearMonthSelector
                  year={entry.year}
                  month={entry.month}
                  onYearChange={(y) => updateEducation(entry.id, { year: y })}
                  onMonthChange={(m) => updateEducation(entry.id, { month: m })}
                />
              </FormField>
              <FormField id={`edu-status-${entry.id}`} label="状態" required>
                <Select
                  value={entry.status}
                  onValueChange={(v) => updateEducation(entry.id, { status: v as EducationStatus })}
                >
                  <SelectTrigger id={`edu-status-${entry.id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </li>
        ))}
      </ol>

      {/* 追加ボタン */}
      <button
        onClick={addEducation}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
      >
        <PlusCircle className="h-4 w-4" />
        学歴を追加
      </button>
    </section>
  );
}
