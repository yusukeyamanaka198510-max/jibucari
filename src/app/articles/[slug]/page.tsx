import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleDetailClient } from "./ArticleDetailClient";
import type { Article } from "@/types/article";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/articles/${params.slug}`, { cache: "no-store" });
    if (res.ok) {
      const article: Article = await res.json();
      return {
        title: `${article.title} | ジブキャリ`,
        description: article.excerpt || undefined,
      };
    }
  } catch {
    // fallback
  }
  return { title: "記事 | ジブキャリ" };
}

export default async function ArticlePage({ params }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/articles/${params.slug}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const article: Article = await res.json();
  return <ArticleDetailClient article={article} />;
}
