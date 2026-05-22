import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import type { Article } from "@/types/article";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content ?? "",
    excerpt: row.excerpt ?? "",
    thumbnailUrl: row.thumbnail_url ?? null,
    category: row.category ?? null,
    published: row.published ?? false,
    publishedAt: row.published_at ?? null,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function checkAdmin(supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (ADMIN_EMAILS.length > 0 && user.email && ADMIN_EMAILS.includes(user.email)) return true;
  if (ADMIN_EMAILS.length === 0) return true; // 開発環境用フォールバック
  return false;
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ items: [] });
  }

  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ items: [] });
  }

  const items = (data ?? []).map(toArticle);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
      excerpt: body.excerpt ?? "",
      thumbnail_url: body.thumbnailUrl ?? null,
      category: body.category ?? null,
      published: body.published ?? false,
      published_at: body.published ? (body.publishedAt ?? now) : null,
      view_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to create" }, { status: 500 });
  }

  return NextResponse.json(toArticle(data), { status: 201 });
}
