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
    type: "motivation" | "selfPR";
    name?: string;
    workHistory?: string;
    format?: string;
  };

  const isMotivation = body.type === "motivation";
  const name = body.name ?? "";
  const work = body.workHistory ?? "（職歴なし）";

  const prompt = isMotivation
    ? `以下の情報をもとに、履歴書の「志望動機」を日本語で200〜300字で書いてください。\n・氏名: ${name}\n・これまでの職歴: ${work}\n\n志望動機のみ出力し、前置きや説明文は不要です。`
    : `以下の情報をもとに、履歴書の「自己PR」を日本語で200〜300字で書いてください。\n・氏名: ${name}\n・これまでの職歴: ${work}\n\n自己PRのみ出力し、前置きや説明文は不要です。`;

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
