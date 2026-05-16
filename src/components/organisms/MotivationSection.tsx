"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { Textarea } from "@/components/atoms/Textarea";
import { cn } from "@/lib/utils";
import type { ResumeFormat } from "@/types";

const MAX_CHARS = 400;

// フォーマット別フィールド定義
const FORMAT_CONFIG: Record<
  ResumeFormat,
  {
    heading: string;
    field1Label: string;
    field1Key: "motivation" | "selfPR";
    field1Placeholder: string;
    field1CanGenerate: boolean;
    field2Label: string;
    field2Key: "motivation" | "selfPR";
    field2Placeholder: string;
    field2CanGenerate: boolean;
    field3Label: string;
    field3Placeholder: string;
  }
> = {
  jis: {
    heading: "志望動機・自己PR",
    field1Label: "志望動機",
    field1Key: "motivation",
    field1Placeholder: "志望動機を入力してください...",
    field1CanGenerate: true,
    field2Label: "自己PR",
    field2Key: "selfPR",
    field2Placeholder: "自己PRを入力してください...",
    field2CanGenerate: true,
    field3Label: "趣味・特技",
    field3Placeholder:
      "例：読書（月5冊ほどのビジネス書）、料理、ランニング\n特技：初対面の方ともすぐに打ち解けられるコミュニケーション力",
  },
  career_change: {
    heading: "転職理由・志望動機・自己PR",
    field1Label: "転職理由",
    field1Key: "selfPR",
    field1Placeholder:
      "前職を退職・転職を検討した理由をご記入ください（例：キャリアアップを目指して、会社の方針変更により…）",
    field1CanGenerate: false,
    field2Label: "志望動機",
    field2Key: "motivation",
    field2Placeholder:
      "応募先企業を選んだ理由・入社してからやりたいことを具体的に記載してください...",
    field2CanGenerate: true,
    field3Label: "趣味・特技",
    field3Placeholder:
      "例：読書（ビジネス書中心）、スポーツ観戦\n特技：短期間での新環境への適応力",
  },
  new_graduate: {
    heading: "自己PR・学生時代の活動",
    field1Label: "自己PR（学生時代に力を入れたこと）",
    field1Key: "motivation",
    field1Placeholder:
      "学生時代に最も力を入れた経験（ゼミ・サークル・アルバイト・ボランティアなど）と、そこから得た学びを記載してください...",
    field1CanGenerate: true,
    field2Label: "研究・ゼミ活動",
    field2Key: "selfPR",
    field2Placeholder:
      "例：〇〇ゼミにて△△をテーマに研究。□□という結論を導き出しました。（未定・なしの場合はその旨を記載）",
    field2CanGenerate: false,
    field3Label: "部活・サークル活動",
    field3Placeholder:
      "例：△△部に所属し、〇〇大会で入賞。チームリーダーとして□□を担当しました。",
  },
  part_time: {
    heading: "志望動機・自己PR",
    field1Label: "志望動機・応募理由",
    field1Key: "motivation",
    field1Placeholder:
      "応募した理由・このお仕事に興味を持ったきっかけを記載してください（例：家から近く、希望シフトに合うため…）",
    field1CanGenerate: true,
    field2Label: "自己PR・アピールポイント",
    field2Key: "selfPR",
    field2Placeholder:
      "元気よく接客できます・体力には自信があります・接客経験3年あります、など...",
    field2CanGenerate: true,
    field3Label: "希望シフト・勤務可能日",
    field3Placeholder:
      "例：平日夕方以降（17:00〜）、土日終日可。週3〜4日希望。\n長期休暇中はフルタイム勤務も可能。",
  },
  no_photo: {
    heading: "志望動機・自己PR",
    field1Label: "志望動機",
    field1Key: "motivation",
    field1Placeholder: "志望動機を入力してください...",
    field1CanGenerate: true,
    field2Label: "自己PR",
    field2Key: "selfPR",
    field2Placeholder: "自己PRを入力してください...",
    field2CanGenerate: true,
    field3Label: "趣味・特技",
    field3Placeholder:
      "例：読書（月5冊ほどのビジネス書）、料理、ランニング\n特技：初対面の方ともすぐに打ち解けられるコミュニケーション力",
  },
};

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

export function MotivationSection({ className, format = "jis" }: { className?: string; format?: ResumeFormat }) {
  const motivation = useResumeStore((s) => s.current?.motivation ?? "");
  const selfPR = useResumeStore((s) => s.current?.selfPR ?? "");
  const hobbies = useResumeStore((s) => s.current?.hobbies ?? "");
  const info = useResumeStore((s) => s.current?.personalInfo);
  const workHistory = useResumeStore((s) => s.current?.workHistory ?? []);
  const setMotivation = useResumeStore((s) => s.setMotivation);
  const setSelfPR = useResumeStore((s) => s.setSelfPR);
  const setHobbies = useResumeStore((s) => s.setHobbies);

  const [genLoading, setGenLoading] = useState<"field1" | "field2" | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const cfg = FORMAT_CONFIG[format];
  const name = info ? `${info.lastName}${info.firstName}` : "";
  const workSummary = workHistory.map((w) => `${w.company} ${w.position ?? ""}`).join("、") || "（職歴なし）";

  const getValue = (key: "motivation" | "selfPR") => key === "motivation" ? motivation : selfPR;
  const setValue = (key: "motivation" | "selfPR") => key === "motivation" ? setMotivation : setSelfPR;

  const handleGenerate = async (field: "field1" | "field2") => {
    const key = field === "field1" ? cfg.field1Key : cfg.field2Key;
    setGenLoading(field);
    setGenError(null);
    try {
      const text = await generateText(key, name, workSummary);
      setValue(key)(text);
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenLoading(null);
    }
  };

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="motivation-heading">
      <h2 id="motivation-heading" className="text-lg font-semibold border-b pb-2">{cfg.heading}</h2>

      {genError && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {genError}
        </div>
      )}

      {/* フィールド1 */}
      <div className="space-y-2">
        <FormField
          id="motivation-field1"
          label={cfg.field1Label}
          hint={`${getValue(cfg.field1Key).length} / ${MAX_CHARS} 文字`}
        >
          <Textarea
            id="motivation-field1"
            value={getValue(cfg.field1Key)}
            onChange={(e) => setValue(cfg.field1Key)(e.target.value)}
            placeholder={cfg.field1Placeholder}
            rows={5}
            maxLength={MAX_CHARS}
          />
        </FormField>
        {cfg.field1CanGenerate && (
          <button
            onClick={() => handleGenerate("field1")}
            disabled={genLoading === "field1"}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-violet-600 disabled:opacity-50 transition-colors"
          >
            {genLoading === "field1"
              ? <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
              : <><Sparkles className="h-4 w-4" />AIで自動生成</>
            }
          </button>
        )}
      </div>

      {/* フィールド2 */}
      <div className="space-y-2">
        <FormField
          id="motivation-field2"
          label={cfg.field2Label}
          hint={`${getValue(cfg.field2Key).length} / ${MAX_CHARS} 文字`}
        >
          <Textarea
            id="motivation-field2"
            value={getValue(cfg.field2Key)}
            onChange={(e) => setValue(cfg.field2Key)(e.target.value)}
            placeholder={cfg.field2Placeholder}
            rows={5}
            maxLength={MAX_CHARS}
          />
        </FormField>
        {cfg.field2CanGenerate && (
          <button
            onClick={() => handleGenerate("field2")}
            disabled={genLoading === "field2"}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-violet-600 disabled:opacity-50 transition-colors"
          >
            {genLoading === "field2"
              ? <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
              : <><Sparkles className="h-4 w-4" />AIで自動生成</>
            }
          </button>
        )}
      </div>

      {/* フィールド3（hobbies） */}
      <FormField id="hobbies" label={cfg.field3Label}>
        <Textarea
          id="hobbies"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          placeholder={cfg.field3Placeholder}
          rows={3}
        />
      </FormField>
    </section>
  );
}
