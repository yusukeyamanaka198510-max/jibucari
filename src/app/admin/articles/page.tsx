import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import type { Article } from "@/types/article";
import { ArticlesAdminClient } from "./ArticlesAdminClient";

export const metadata: Metadata = { title: "記事管理 | ジブキャリ管理" };
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

export default async function AdminArticlesPage() {
  let articles: Article[] = [];
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("updated_at", { ascending: false });
    articles = (data ?? []).map(toArticle);
  }

  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">記事管理</h1>
          <p className="text-sm text-slate-500">ブログ記事の作成・編集・公開管理を行います</p>
        </div>
      </div>
      <ArticlesAdminClient articles={articles} />
    </div>
  );
}
