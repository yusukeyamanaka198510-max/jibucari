import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { SupabaseResumeRepository } from "@/infrastructure/repositories/supabaseResumeRepository";
import { updateResumeUseCase } from "@/domain/usecases/updateResume";
import type { Resume, ResumeUpdate } from "@/types";

interface RouteContext {
  params: { id: string };
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/resume/[id] */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const repo = new SupabaseResumeRepository(supabase);
  const resume = await repo.findById(params.id);
  if (!resume || resume.userId !== user.id)
    return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return NextResponse.json({ data: resume });
}

/** PATCH /api/resume/[id] — 部分更新 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const patch = await req.json() as ResumeUpdate;
  const repo = new SupabaseResumeRepository(supabase);

  const existing = await repo.findById(params.id);
  if (!existing || existing.userId !== user.id)
    return NextResponse.json({ error: "Not Found" }, { status: 404 });

  try {
    const updated = await updateResumeUseCase(repo, params.id, patch);
    return NextResponse.json({ data: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** PUT /api/resume/[id] — upsert（ログイン後の自動保存で使用） */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const resume = await req.json() as Resume;
  const repo = new SupabaseResumeRepository(supabase);

  try {
    const saved = await repo.upsert({ ...resume, userId: user.id });
    return NextResponse.json({ data: saved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** DELETE /api/resume/[id] */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return unauthorized();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const repo = new SupabaseResumeRepository(supabase);
  const existing = await repo.findById(params.id);
  if (!existing || existing.userId !== user.id)
    return NextResponse.json({ error: "Not Found" }, { status: 404 });

  await repo.delete(params.id);
  return new NextResponse(null, { status: 204 });
}
