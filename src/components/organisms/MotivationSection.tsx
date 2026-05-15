"use client";

import { Sparkles } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const MAX_CHARS = 400;

/**
 * 志望動機・自己PR・趣味入力セクション Organism。
 * AI生成ボタンはプレースホルダー実装（APIキーが設定された後に実装）。
 */
export function MotivationSection({ className }: { className?: string }) {
  const motivation = useResumeStore((s) => s.current?.motivation ?? "");
  const selfPR = useResumeStore((s) => s.current?.selfPR ?? "");
  const hobbies = useResumeStore((s) => s.current?.hobbies ?? "");
  const setMotivation = useResumeStore((s) => s.setMotivation);
  const setSelfPR = useResumeStore((s) => s.setSelfPR);
  const setHobbies = useResumeStore((s) => s.setHobbies);

  return (
    <section
      className={cn("space-y-6", className)}
      aria-labelledby="motivation-heading"
    >
      <h2
        id="motivation-heading"
        className="text-lg font-semibold border-b pb-2"
      >
        志望動機・自己PR
      </h2>

      {/* 志望動機 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FormField
            id="motivation"
            label="志望動機"
            hint={`${motivation.length} / ${MAX_CHARS} 文字`}
            className="flex-1"
          >
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="志望動機を入力してください..."
              rows={5}
              maxLength={MAX_CHARS}
              aria-describedby="motivation-count"
            />
          </FormField>
        </div>
        {/* AI生成ボタン（プレースホルダー） */}
        <Button
          variant="outline"
          size="sm"
          disabled
          title="AI生成機能は近日公開予定"
          className="gap-1.5 text-muted-foreground"
        >
          <Sparkles className="h-4 w-4" />
          AIで自動生成（準備中）
        </Button>
      </div>

      {/* 自己PR */}
      <div className="space-y-2">
        <FormField
          id="selfPR"
          label="自己PR"
          hint={`${selfPR.length} / ${MAX_CHARS} 文字`}
        >
          <Textarea
            id="selfPR"
            value={selfPR}
            onChange={(e) => setSelfPR(e.target.value)}
            placeholder="自己PRを入力してください..."
            rows={5}
            maxLength={MAX_CHARS}
          />
        </FormField>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="AI生成機能は近日公開予定"
          className="gap-1.5 text-muted-foreground"
        >
          <Sparkles className="h-4 w-4" />
          AIで自動生成（準備中）
        </Button>
      </div>

      {/* 趣味・特技 */}
      <FormField id="hobbies" label="趣味・特技">
        <Textarea
          id="hobbies"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          placeholder="趣味・特技を入力してください..."
          rows={2}
        />
      </FormField>
    </section>
  );
}
