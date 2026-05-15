"use client";

import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import type { EducationStatus } from "@/types";

const STATUS_OPTIONS: { value: EducationStatus; label: string }[] = [
  { value: "graduated", label: "卒業" },
  { value: "enrolled", label: "在学中" },
  { value: "dropped_out", label: "中退" },
  { value: "transferred", label: "転学" },
];

/**
 * 学歴入力セクション Organism。
 * エントリの追加・削除・編集を管理する。
 */
export function EducationSection({ className }: { className?: string }) {
  const education = useResumeStore((s) => s.current?.education ?? []);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="education-heading"
    >
      <div className="flex items-center justify-between border-b pb-2">
        <h2 id="education-heading" className="text-lg font-semibold">
          学歴
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={addEducation}
          aria-label="学歴を追加"
        >
          <PlusCircle className="h-4 w-4" />
          追加
        </Button>
      </div>

      {education.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          「追加」ボタンで学歴を入力してください
        </p>
      )}

      <ol className="space-y-4">
        {education.map((entry, index) => (
          <li
            key={entry.id}
            className="rounded-lg border p-4 space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                学歴 {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(entry.id)}
                aria-label={`学歴 ${index + 1} を削除`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField id={`edu-school-${entry.id}`} label="学校名" required>
                <Input
                  id={`edu-school-${entry.id}`}
                  value={entry.school}
                  onChange={(e) =>
                    updateEducation(entry.id, { school: e.target.value })
                  }
                  placeholder="〇〇大学"
                />
              </FormField>

              <FormField id={`edu-faculty-${entry.id}`} label="学部・学科">
                <Input
                  id={`edu-faculty-${entry.id}`}
                  value={entry.faculty ?? ""}
                  onChange={(e) =>
                    updateEducation(entry.id, { faculty: e.target.value })
                  }
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
                  onValueChange={(v) =>
                    updateEducation(entry.id, { status: v as EducationStatus })
                  }
                >
                  <SelectTrigger id={`edu-status-${entry.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
