"use client";

import { useState } from "react";
import { Trash2, PlusCircle, BriefcaseBusiness, X } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import type { WorkStatus } from "@/types";

const STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: "joined", label: "入社" },
  { value: "resigned", label: "退職" },
  { value: "current", label: "在職中" },
];

export function WorkHistorySection({ className }: { className?: string }) {
  const workHistory = useResumeStore((s) => s.current?.workHistory ?? []);
  const addWork = useResumeStore((s) => s.addWork);
  const updateWork = useResumeStore((s) => s.updateWork);
  const removeWork = useResumeStore((s) => s.removeWork);

  const [noWork, setNoWork] = useState(false);

  return (
    <section className={cn("space-y-4", className)} aria-labelledby="work-history-heading">
      <h2 id="work-history-heading" className="text-lg font-semibold border-b pb-2">職歴</h2>

      {/* 職歴あり / なし 切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setNoWork(false)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
            !noWork
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          )}
        >
          <BriefcaseBusiness className="h-4 w-4 inline mr-1.5" />
          職歴あり
        </button>
        <button
          onClick={() => setNoWork(true)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
            noWork
              ? "border-slate-500 bg-slate-50 text-slate-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          )}
        >
          <X className="h-4 w-4 inline mr-1.5" />
          職歴なし（新卒など）
        </button>
      </div>

      {noWork ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-slate-400 text-sm">
          職歴なしとして記載されます
        </div>
      ) : (
        <>
          <ol className="space-y-4">
            {workHistory.map((entry, index) => (
              <li key={entry.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">職歴 {index + 1}</span>
                  <button
                    onClick={() => removeWork(entry.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={`職歴 ${index + 1} を削除`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField id={`work-company-${entry.id}`} label="会社名" required>
                    <Input
                      id={`work-company-${entry.id}`}
                      value={entry.company}
                      onChange={(e) => updateWork(entry.id, { company: e.target.value })}
                      placeholder="株式会社〇〇"
                    />
                  </FormField>
                  <FormField id={`work-position-${entry.id}`} label="役職・職種">
                    <Input
                      id={`work-position-${entry.id}`}
                      value={entry.position ?? ""}
                      onChange={(e) => updateWork(entry.id, { position: e.target.value })}
                      placeholder="Webエンジニア"
                    />
                  </FormField>
                  <FormField id={`work-dept-${entry.id}`} label="部署">
                    <Input
                      id={`work-dept-${entry.id}`}
                      value={entry.department ?? ""}
                      onChange={(e) => updateWork(entry.id, { department: e.target.value })}
                      placeholder="開発部"
                    />
                  </FormField>
                  <FormField id={`work-year-${entry.id}`} label="年月" required>
                    <YearMonthSelector
                      year={entry.year}
                      month={entry.month}
                      onYearChange={(y) => updateWork(entry.id, { year: y })}
                      onMonthChange={(m) => updateWork(entry.id, { month: m })}
                    />
                  </FormField>
                  <FormField id={`work-status-${entry.id}`} label="状態" required>
                    <Select
                      value={entry.status}
                      onValueChange={(v) => updateWork(entry.id, { status: v as WorkStatus })}
                    >
                      <SelectTrigger id={`work-status-${entry.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField id={`work-desc-${entry.id}`} label="業務内容">
                  <Textarea
                    id={`work-desc-${entry.id}`}
                    value={entry.description ?? ""}
                    onChange={(e) => updateWork(entry.id, { description: e.target.value })}
                    placeholder="担当業務・実績を記載してください"
                    rows={3}
                  />
                </FormField>
              </li>
            ))}
          </ol>

          <button
            onClick={addWork}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            職歴を追加
          </button>
        </>
      )}
    </section>
  );
}
