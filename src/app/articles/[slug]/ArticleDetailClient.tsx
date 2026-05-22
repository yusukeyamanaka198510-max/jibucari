"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Eye, Tag, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Article } from "@/types/article";

interface Props {
  article: Article;
}

export function ArticleDetailClient({ article }: Props) {
  useEffect(() => {
    fetch(`/api/articles/${article.slug}/view`, { method: "POST" }).catch(() => {});
  }, [article.slug]);

  const paragraphs = article.content
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/articles"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              記事一覧
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm text-slate-700 truncate max-w-[160px] sm:max-w-xs">
              {article.title}
            </span>
          </div>
          <Link
            href="/resume/new"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            無料でつくる →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* 記事ヘッダー */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          {article.category && (
            <div className="flex items-center gap-1 mb-3">
              <Tag className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-500">{article.category}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-slate-100">
            {article.publishedAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(article.publishedAt), "yyyy年M月d日", { locale: ja })}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              <span>{article.viewCount.toLocaleString()} 閲覧</span>
            </div>
          </div>
        </div>

        {/* 本文 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap"
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-lg">
              今すぐ履歴書を無料で作成しよう
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              ジブキャリなら登録不要ですぐ作成・PDF出力できます。
            </p>
          </div>
          <Link
            href="/resume/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-lg shadow-indigo-200"
          >
            <FileText className="h-4 w-4" />
            無料で履歴書を作成する →
          </Link>
          <p className="text-xs text-slate-400">
            <Link href="/articles" className="underline hover:text-indigo-600 transition-colors">
              ← 記事一覧に戻る
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
