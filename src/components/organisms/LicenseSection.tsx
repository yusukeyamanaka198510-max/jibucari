"use client";

import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import type { LicenseEntry } from "@/types";

const LICENSE_PRESETS = [
  "普通自動車第一種運転免許（MT）",
  "普通自動車第一種運転免許（AT限定）",
  "準中型自動車運転免許",
  "中型自動車運転免許",
  "大型自動車運転免許",
  "普通自動二輪免許（MT）",
  "大型自動二輪免許",
  "原付免許",
  "大型特殊免許",
  "けん引免許",
  "普通自動車第二種運転免許",
];

export function LicenseSection({ className }: { className?: string }) {
  const licenses = useResumeStore((s) => s.current?.licenses ?? []);
  const addLicense = useResumeStore((s) => s.addLicense);
  const updateLicense = useResumeStore((s) => s.updateLicense);
  const removeLicense = useResumeStore((s) => s.removeLicense);

  const licenseEntries = licenses.filter((l) => l.category === "license");
  const qualEntries = licenses.filter((l) => l.category === "qualification");

  const getPresetEntry = (name: string) =>
    licenseEntries.find((l) => l.name === name);

  const customEntries = licenseEntries.filter(
    (l) => !LICENSE_PRESETS.includes(l.name)
  );

  const togglePreset = (name: string) => {
    const existing = getPresetEntry(name);
    if (existing) {
      removeLicense(existing.id);
    } else {
      addLicense("license", name);
    }
  };

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="license-heading">
      <h2 id="license-heading" className="text-lg font-semibold border-b pb-2">
        免許・資格
      </h2>

      {/* ── 免許 ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">免許</h3>
        <p className="text-xs text-slate-400">
          取得している免許にチェックを入れて取得年月を入力してください
        </p>

        <div className="space-y-2">
          {LICENSE_PRESETS.map((name) => {
            const entry = getPresetEntry(name);
            const checked = !!entry;
            return (
              <label
                key={name}
                className={cn(
                  "flex flex-wrap items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                  checked
                    ? "border-indigo-300 bg-indigo-50/60"
                    : "border-slate-100 bg-white hover:border-slate-200"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePreset(name)}
                  className="w-4 h-4 accent-indigo-600 flex-shrink-0"
                />
                <span className="text-sm flex-1 min-w-0">{name}</span>
                {checked && entry && (
                  <div onClick={(e) => e.preventDefault()}>
                    <YearMonthSelector
                      year={entry.year}
                      month={entry.month}
                      onYearChange={(y) => updateLicense(entry.id, { year: y })}
                      onMonthChange={(m) => updateLicense(entry.id, { month: m })}
                    />
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {/* その他（カスタム）免許 */}
        {customEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-end gap-3 p-3 rounded-xl border-2 border-indigo-300 bg-indigo-50/60"
          >
            <input
              type="checkbox"
              checked
              onChange={() => removeLicense(entry.id)}
              className="w-4 h-4 accent-indigo-600 self-center flex-shrink-0 mt-5"
            />
            <FormField id={`lic-custom-name-${entry.id}`} label="免許名" required className="flex-1 min-w-40">
              <Input
                id={`lic-custom-name-${entry.id}`}
                value={entry.name}
                onChange={(e) => updateLicense(entry.id, { name: e.target.value })}
                placeholder="免許・資格名を入力"
              />
            </FormField>
            <YearMonthSelector
              year={entry.year}
              month={entry.month}
              onYearChange={(y) => updateLicense(entry.id, { year: y })}
              onMonthChange={(m) => updateLicense(entry.id, { month: m })}
            />
            <button
              onClick={() => removeLicense(entry.id)}
              className="text-slate-400 hover:text-red-500 transition-colors pb-2"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={() => addLicense("license", "")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          その他の免許を追加
        </button>
      </div>

      {/* ── 資格 ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">資格</h3>

        <ol className="space-y-2">
          {qualEntries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50/50"
            >
              <YearMonthSelector
                year={entry.year}
                month={entry.month}
                onYearChange={(y) => updateLicense(entry.id, { year: y })}
                onMonthChange={(m) => updateLicense(entry.id, { month: m })}
              />
              <div className="flex-1 min-w-40">
                <Input
                  value={entry.name}
                  onChange={(e) => updateLicense(entry.id, { name: e.target.value })}
                  placeholder="日商簿記2級 / TOEIC 850点 など"
                />
              </div>
              <button
                onClick={() => removeLicense(entry.id)}
                className="text-slate-400 hover:text-red-500 transition-colors pb-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>

        <button
          onClick={() => addLicense("qualification")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          資格を追加
        </button>
      </div>
    </section>
  );
}
