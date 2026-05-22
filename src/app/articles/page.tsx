import type { Metadata } from "next";
import { ArticlesListClient } from "./ArticlesListClient";
import type { Article } from "@/types/article";

export const metadata: Metadata = { title: "活用法まとめ | ジブキャリ" };
export const revalidate = 60;

export default async function ArticlesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  let articles: Article[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/articles`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      articles = json.items ?? [];
    }
  } catch {
    // fetchエラー時は空配列
  }
  return <ArticlesListClient articles={articles} />;
}
