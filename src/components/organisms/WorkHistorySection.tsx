"use client";

import { Trash2, PlusCircle } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import type { WorkStatus } from "@/types";

const STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: "joined", label: "入社" },
  { value: "resigned", label: "退職" },
  { value: "current", label: "在職中" },
];

/**
 * 職歴入力セクション Organism。
 */
export function WorkHistorySection({ className }: { className?: string }) {
  const workHistory = useResumeStore((s) => s.current?.workHistory ?? []);
  const addWork = useResumeStore((s) => s.addWork);
  const updateWork = useResumeStore((s) => s.updateWork);
  const removeWork = useResumeStore((s) => s.removeWork);

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="work-history-heading"
    >
      <div className="flex items-center justify-between border-b pb-2">
        <h2 id="work-history-heading" className="text-lg font-semibold">
          職歴
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={addWork}
          aria-label="職歴を追加"
        >
          <PlusCircle className="h-4 w-4" />
          追加
        </Button>
      </div>

      {workHistory.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          「追加」ボタンで職歴を入力してください
        </p>
      )}

      <ol className="space-y-4">
        {workHistory.map((entry, index) => (
          <li key={entry.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                職歴 {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeWork(entry.id)}
                aria-label={`職歴 ${index + 1} を削除`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField id={`work-company-${entry.id}`} label="会社名" required>
                <Input
                  id={`work-company-${entry.id}`}
                  value={entry.company}
                  onChange={(e) =>
                    updateWork(entry.id, { company: e.target.value })
                  }
                  placeholder="株式会社〇〇"
                />
              </FormField>

              <FormField id={`work-position-${entry.id}`} label="役職・職種">
                <Input
                  id={`work-position-${entry.id}`}
                  value={entry.position ?? ""}
                  onChange={(e) =>
                    updateWork(entry.id, { position: e.target.value })
                  }
                  placeholder="Webエンジニア"
                />
              </FormField>

              <FormField id={`work-dept-${entry.id}`} label="部署">
                <Input
                  id={`work-dept-${entry.id}`}
                  value={entry.department ?? ""}
                  onChange={(e) =>
                    updateWork(entry.id, { department: e.target.value })
                  }
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
                  onValueChange={(v) =>
                    updateWork(entry.id, { status: v as WorkStatus })
                  }
                >
                  <SelectTrigger id={`work-status-${entry.id}`}>
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

            <FormField id={`work-desc-${entry.id}`} label="業務内容">
              <Textarea
                id={`work-desc-${entry.id}`}
                value={entry.description ?? ""}
                onChange={(e) =>
                  updateWork(entry.id, { description: e.target.value })
                }
                placeholder="担当業務・実績を記載してください"
                rows={3}
              />
            </FormField>
          </li>
        ))}
      </ol>
    </section>
  );
}
