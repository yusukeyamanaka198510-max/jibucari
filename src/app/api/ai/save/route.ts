import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { SupabaseResumeRepository } from "@/infrastructure/repositories/supabaseResumeRepository";
import { createEmptyPersonalInfo } from "@/domain/entities/resume";
import { v4 as uuidv4 } from "uuid";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { genType, text, company, position } = await req.json() as {
    genType: "selfPR" | "motivation" | "summary";
    text: string;
    company?: string;
    position?: string;
  };

  const typeLabel =
    genType === "selfPR" ? "自己PR" :
    genType === "motivation" ? "志望動機" : "職務要約";
  const context = [company, position].filter(Boolean).join("・") || "未入力";
  const now = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  const title = `${typeLabel}｜${context}（${dateStr}）`;

  const repo = new SupabaseResumeRepository(supabase);
  const saved = await repo.upsert({
    id: uuidv4(),
    userId: user.id,
    format: "ai_draft",
    title,
    personalInfo: createEmptyPersonalInfo(),
    education: [],
    workHistory: [],
    licenses: [],
    motivation: genType === "motivation" ? text : "",
    selfPR: genType === "selfPR" ? text : genType === "summary" ? text : "",
    hobbies: "",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ data: saved }, { status: 201 });
}
