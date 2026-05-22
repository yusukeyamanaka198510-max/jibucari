import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import type { Article } from "@/types/article";

export const dynamic = "force-dynamic";

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

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ items: [] });
  }

  const items = (data ?? []).map(toArticle);
  return NextResponse.json({ items });
}
