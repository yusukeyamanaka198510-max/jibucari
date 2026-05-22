import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ArticleFormClient } from "../ArticleFormClient";

export const metadata: Metadata = { title: "新規記事作成 | ジブキャリ管理" };

export default function AdminArticleNewPage() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">記事管理</h1>
          <p className="text-sm text-slate-500">新しい記事を作成します</p>
        </div>
      </div>
      <ArticleFormClient />
    </div>
  );
}
