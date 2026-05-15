"use client";

import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

/**
 * 資格・免許入力セクション Organism。
 */
export function LicenseSection({ className }: { className?: string }) {
  const licenses = useResumeStore((s) => s.current?.licenses ?? []);
  const addLicense = useResumeStore((s) => s.addLicense);
  const updateLicense = useResumeStore((s) => s.updateLicense);
  const removeLicense = useResumeStore((s) => s.removeLicense);

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="license-heading"
    >
      <div className="flex items-center justify-between border-b pb-2">
        <h2 id="license-heading" className="text-lg font-semibold">
          資格・免許
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={addLicense}
          aria-label="資格・免許を追加"
        >
          <PlusCircle className="h-4 w-4" />
          追加
        </Button>
      </div>

      {licenses.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          「追加」ボタンで資格・免許を入力してください
        </p>
      )}

      <ol className="space-y-3">
        {licenses.map((entry, index) => (
          <li
            key={entry.id}
            className="rounded-lg border p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
          >
            <FormField id={`lic-year-${entry.id}`} label="取得年月" required>
              <YearMonthSelector
                year={entry.year}
                month={entry.month}
                onYearChange={(y) => updateLicense(entry.id, { year: y })}
                onMonthChange={(m) => updateLicense(entry.id, { month: m })}
              />
            </FormField>

            <FormField id={`lic-name-${entry.id}`} label="資格名・免許名" required>
              <Input
                id={`lic-name-${entry.id}`}
                value={entry.name}
                onChange={(e) =>
                  updateLicense(entry.id, { name: e.target.value })
                }
                placeholder="普通自動車第一種運転免許"
              />
            </FormField>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLicense(entry.id)}
              aria-label={`資格 ${index + 1} を削除`}
              className="text-muted-foreground hover:text-destructive self-end"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ol>
    </section>
  );
}
