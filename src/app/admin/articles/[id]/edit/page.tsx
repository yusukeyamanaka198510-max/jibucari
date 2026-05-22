import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import type { Article } from "@/types/article";
import { ArticleFormClient } from "../../ArticleFormClient";

export const metadata: Metadata = { title: "記事を編集 | ジブキャリ管理" };
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

interface Props {
  params: { id: string };
}

export default async function AdminArticleEditPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  const article = toArticle(data);

  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">記事管理</h1>
          <p className="text-sm text-slate-500">記事を編集します</p>
        </div>
      </div>
      <ArticleFormClient article={article} />
    </div>
  );
}
