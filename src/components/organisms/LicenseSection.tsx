"use client";

import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import type { LicenseEntry } from "@/types";

function EntryList({
  entries,
  category,
  onUpdate,
  onRemove,
  onAdd,
  label,
  placeholder,
}: {
  entries: LicenseEntry[];
  category: LicenseEntry["category"];
  onUpdate: (id: string, patch: Partial<LicenseEntry>) => void;
  onRemove: (id: string) => void;
  onAdd: (category: LicenseEntry["category"]) => void;
  label: string;
  placeholder: string;
}) {
  const filtered = entries.filter((e) => e.category === category);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>

      <ol className="space-y-2">
        {filtered.map((entry, index) => (
          <li key={entry.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 items-end">
            <FormField id={`lic-year-${entry.id}`} label="取得年月" required>
              <YearMonthSelector
                year={entry.year}
                month={entry.month}
                onYearChange={(y) => onUpdate(entry.id, { year: y })}
                onMonthChange={(m) => onUpdate(entry.id, { month: m })}
              />
            </FormField>
            <FormField id={`lic-name-${entry.id}`} label="名称" required>
              <Input
                id={`lic-name-${entry.id}`}
                value={entry.name}
                onChange={(e) => onUpdate(entry.id, { name: e.target.value })}
                placeholder={placeholder}
              />
            </FormField>
            <button
              onClick={() => onRemove(entry.id)}
              className="text-slate-400 hover:text-red-500 transition-colors self-end pb-2"
              aria-label={`${index + 1}番目を削除`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>

      <button
        onClick={() => onAdd(category)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
      >
        <PlusCircle className="h-4 w-4" />
        {label}を追加
      </button>
    </div>
  );
}

export function LicenseSection({ className }: { className?: string }) {
  const licenses = useResumeStore((s) => s.current?.licenses ?? []);
  const addLicense = useResumeStore((s) => s.addLicense);
  const updateLicense = useResumeStore((s) => s.updateLicense);
  const removeLicense = useResumeStore((s) => s.removeLicense);

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="license-heading">
      <h2 id="license-heading" className="text-lg font-semibold border-b pb-2">免許・資格</h2>

      <EntryList
        entries={licenses}
        category="license"
        onUpdate={updateLicense}
        onRemove={removeLicense}
        onAdd={addLicense}
        label="免許"
        placeholder="普通自動車第一種運転免許"
      />

      <EntryList
        entries={licenses}
        category="qualification"
        onUpdate={updateLicense}
        onRemove={removeLicense}
        onAdd={addLicense}
        label="資格"
        placeholder="日商簿記2級 / TOEIC 850点"
      />
    </section>
  );
}
