import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { UpsertArticleInput } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/articles/[id] */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { data, error } = await admin
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

/** PATCH /api/admin/articles/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const body = (await req.json()) as Partial<UpsertArticleInput>;

  // 公開に変更する場合は published_at をセット
  const updates: Record<string, unknown> = {};
  if (body.title        !== undefined) updates.title         = body.title;
  if (body.slug         !== undefined) updates.slug          = body.slug;
  if (body.content      !== undefined) updates.content       = body.content;
  if (body.excerpt      !== undefined) updates.excerpt       = body.excerpt;
  if (body.category     !== undefined) updates.category      = body.category;
  if (body.thumbnailUrl !== undefined) updates.thumbnail_url = body.thumbnailUrl;
  if (body.status       !== undefined) {
    updates.status = body.status;
    if (body.status === "published" && !body.publishedAt) {
      updates.published_at = new Date().toISOString();
    }
  }
  if (body.publishedAt  !== undefined) updates.published_at  = body.publishedAt;

  const { data: before } = await admin.from("articles").select("title, status").eq("id", params.id).single();

  const { data, error } = await admin
    .from("articles")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const beforeData = before as { title: string; status: string } | null;
  await admin.from("admin_operation_logs").insert({
    operation_type: "update",
    target_type:    "article",
    target_id:      params.id,
    summary:        `記事「${beforeData?.title ?? params.id}」を更新`,
    diff: {
      before: { status: beforeData?.status },
      after:  { status: updates.status },
    },
  });

  return NextResponse.json({ data });
}

/** DELETE /api/admin/articles/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { data: article } = await admin.from("articles").select("title").eq("id", params.id).single();
  const { error } = await admin.from("articles").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("admin_operation_logs").insert({
    operation_type: "delete",
    target_type:    "article",
    target_id:      params.id,
    summary:        `記事「${(article as { title?: string } | null)?.title ?? params.id}」を削除`,
  });

  return NextResponse.json({ success: true });
}
