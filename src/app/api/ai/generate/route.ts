import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  if (!client) {
    return NextResponse.json({ error: "AI機能は現在利用できません" }, { status: 503 });
  }

  const body = await req.json() as {
    type: "motivation" | "selfPR" | "summary";
    // 既存フィールド（ResumeFormLayout から）
    name?: string;
    workHistory?: string;
    format?: string;
    // AIサポートページからの拡張フィールド
    company?: string;
    position?: string;
    strength?: string;
    experience?: string;
    achievement?: string;
  };

  const name       = body.name       ?? "";
  const work       = body.workHistory ?? "（職歴なし）";
  const company    = body.company    ?? "";
  const position   = body.position   ?? "";
  const strength   = body.strength   ?? "";
  const experience = body.experience ?? "";
  const achievement = body.achievement ?? "";

  // AIサポートページからの呼び出し（拡張フィールドあり）
  const isRich = !!(company || strength || experience || achievement);

  let prompt: string;

  if (body.type === "motivation") {
    prompt = isRich
      ? `以下の情報をもとに、履歴書・転職用の「志望動機」を日本語で200〜300字で書いてください。\n` +
        `・応募先: ${company || "（未入力）"}\n` +
        `・応募職種: ${position || "（未入力）"}\n` +
        `・自分の強み: ${strength || "（未入力）"}\n` +
        `・これまでの経験: ${experience || "（未入力）"}\n` +
        `・成果・工夫: ${achievement || "（未入力）"}\n\n` +
        `志望動機のみ出力し、前置きや説明文は不要です。`
      : `以下の情報をもとに、履歴書の「志望動機」を日本語で200〜300字で書いてください。\n・氏名: ${name}\n・これまでの職歴: ${work}\n\n志望動機のみ出力し、前置きや説明文は不要です。`;
  } else if (body.type === "selfPR") {
    prompt = isRich
      ? `以下の情報をもとに、履歴書・転職用の「自己PR」を日本語で200〜300字で書いてください。\n` +
        `・応募先: ${company || "（未入力）"}\n` +
        `・応募職種: ${position || "（未入力）"}\n` +
        `・自分の強み: ${strength || "（未入力）"}\n` +
        `・これまでの経験: ${experience || "（未入力）"}\n` +
        `・成果・工夫: ${achievement || "（未入力）"}\n\n` +
        `自己PRのみ出力し、前置きや説明文は不要です。`
      : `以下の情報をもとに、履歴書の「自己PR」を日本語で200〜300字で書いてください。\n・氏名: ${name}\n・これまでの職歴: ${work}\n\n自己PRのみ出力し、前置きや説明文は不要です。`;
  } else {
    // summary（職務要約）
    prompt =
      `以下の情報をもとに、職務経歴書の「職務要約」を日本語で150〜250字で書いてください。\n` +
      `・応募先: ${company || "（未入力）"}\n` +
      `・応募職種: ${position || "（未入力）"}\n` +
      `・自分の強み: ${strength || "（未入力）"}\n` +
      `・これまでの経験: ${experience || "（未入力）"}\n` +
      `・成果・工夫: ${achievement || "（未入力）"}\n\n` +
      `職務要約のみ出力し、前置きや説明文は不要です。`;
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
