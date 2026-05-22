import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { UpsertArticleInput } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/articles */
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const sp = req.nextUrl.searchParams;
  const status   = sp.get("status");
  const category = sp.get("category");
  const page     = Number(sp.get("page") ?? 1);
  const perPage  = Number(sp.get("perPage") ?? 20);

  let query = admin
    .from("articles")
    .select("id, title, slug, category, status, excerpt, published_at, created_at, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status)   query = query.eq("status", status);
  if (category) query = query.eq("category", category);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total:      count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  });
}

/** POST /api/admin/articles — 記事作成 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const body = (await req.json()) as UpsertArticleInput;
  if (!body.title?.trim() || !body.category) {
    return NextResponse.json({ error: "title and category are required" }, { status: 400 });
  }

  const publishedAt = body.status === "published"
    ? (body.publishedAt ?? new Date().toISOString())
    : null;

  const { data, error } = await admin
    .from("articles")
    .insert({
      title:         body.title,
      slug:          body.slug ?? null,
      content:       body.content ?? "",
      excerpt:       body.excerpt ?? null,
      category:      body.category,
      status:        body.status ?? "draft",
      thumbnail_url: body.thumbnailUrl ?? null,
      published_at:  publishedAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("admin_operation_logs").insert({
    operation_type: "create",
    target_type:    "article",
    target_id:      (data as { id: string }).id,
    summary:        `記事「${body.title}」を作成`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
