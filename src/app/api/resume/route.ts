import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { SupabaseResumeRepository } from "@/infrastructure/repositories/supabaseResumeRepository";
import { createResumeUseCase } from "@/domain/usecases/createResume";
import type { ResumeFormat } from "@/types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/resume — ユーザーの履歴書一覧取得 */
export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("per_page") ?? 20);

  const repo = new SupabaseResumeRepository(supabase);
  const result = await repo.findAll(user.id, page, perPage);
  return NextResponse.json(result);
}

/** POST /api/resume — 新規履歴書作成 */
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await req.json() as { format?: ResumeFormat; title?: string };
  const repo = new SupabaseResumeRepository(supabase);

  try {
    const resume = await createResumeUseCase(repo, {
      format: body.format ?? "jis",
      title: body.title,
      userId: user.id,
    });
    return NextResponse.json({ data: resume }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
