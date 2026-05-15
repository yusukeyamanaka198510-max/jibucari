"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { Textarea } from "@/components/atoms/Textarea";
import { cn } from "@/lib/utils";

const MAX_CHARS = 400;

const HOBBY_PLACEHOLDER =
  "例：読書（月5冊ほどのビジネス書）、料理、ランニング\n特技：初対面の方ともすぐに打ち解けられるコミュニケーション力";

async function generateText(type: "motivation" | "selfPR", name: string, work: string): Promise<string> {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name, workHistory: work }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "生成に失敗しました");
  const json = await res.json();
  return json.text as string;
}

export function MotivationSection({ className }: { className?: string }) {
  const motivation = useResumeStore((s) => s.current?.motivation ?? "");
  const selfPR = useResumeStore((s) => s.current?.selfPR ?? "");
  const hobbies = useResumeStore((s) => s.current?.hobbies ?? "");
  const info = useResumeStore((s) => s.current?.personalInfo);
  const workHistory = useResumeStore((s) => s.current?.workHistory ?? []);
  const setMotivation = useResumeStore((s) => s.setMotivation);
  const setSelfPR = useResumeStore((s) => s.setSelfPR);
  const setHobbies = useResumeStore((s) => s.setHobbies);

  const [genLoading, setGenLoading] = useState<"motivation" | "selfPR" | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const name = info ? `${info.lastName}${info.firstName}` : "";
  const workSummary = workHistory.map((w) => `${w.company} ${w.position ?? ""}`).join("、") || "（職歴なし）";

  const handleGenerate = async (type: "motivation" | "selfPR") => {
    setGenLoading(type);
    setGenError(null);
    try {
      const text = await generateText(type, name, workSummary);
      if (type === "motivation") setMotivation(text);
      else setSelfPR(text);
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenLoading(null);
    }
  };

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="motivation-heading">
      <h2 id="motivation-heading" className="text-lg font-semibold border-b pb-2">志望動機・自己PR</h2>

      {genError && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {genError}
        </div>
      )}

      {/* 志望動機 */}
      <div className="space-y-2">
        <FormField id="motivation" label="志望動機" hint={`${motivation.length} / ${MAX_CHARS} 文字`}>
          <Textarea
            id="motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="志望動機を入力してください..."
            rows={5}
            maxLength={MAX_CHARS}
          />
        </FormField>
        <button
          onClick={() => handleGenerate("motivation")}
          disabled={genLoading === "motivation"}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-violet-600 disabled:opacity-50 transition-colors"
        >
          {genLoading === "motivation"
            ? <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
            : <><Sparkles className="h-4 w-4" />AIで自動生成</>
          }
        </button>
      </div>

      {/* 自己PR */}
      <div className="space-y-2">
        <FormField id="selfPR" label="自己PR" hint={`${selfPR.length} / ${MAX_CHARS} 文字`}>
          <Textarea
            id="selfPR"
            value={selfPR}
            onChange={(e) => setSelfPR(e.target.value)}
            placeholder="自己PRを入力してください..."
            rows={5}
            maxLength={MAX_CHARS}
          />
        </FormField>
        <button
          onClick={() => handleGenerate("selfPR")}
          disabled={genLoading === "selfPR"}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-violet-600 disabled:opacity-50 transition-colors"
        >
          {genLoading === "selfPR"
            ? <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
            : <><Sparkles className="h-4 w-4" />AIで自動生成</>
          }
        </button>
      </div>

      {/* 趣味・特技 */}
      <FormField id="hobbies" label="趣味・特技">
        <Textarea
          id="hobbies"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          placeholder={HOBBY_PLACEHOLDER}
          rows={3}
        />
      </FormField>

    </section>
  );
}
