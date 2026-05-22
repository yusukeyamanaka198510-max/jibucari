"use client";

import Link from "next/link";
import { ChevronLeft, BookOpen, Eye, Tag, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";
import type { Article } from "@/types/article";

interface Props {
  articles: Article[];
}

export function ArticlesListClient({ articles }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter((c): c is string => !!c))
  );

  const filtered =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              トップ
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm text-slate-700">活用法まとめ</span>
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
        {/* タイトル */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">活用法まとめ</h1>
            <p className="text-sm text-slate-500 mt-1">
              履歴書・職務経歴書の書き方から転職ノウハウまで、お役立ち情報をまとめています。
            </p>
          </div>
        </div>

        {/* カテゴリフィルタ */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 記事一覧 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-3 text-center">
            <BookOpen className="h-10 w-10 text-slate-200" />
            <p className="font-semibold text-slate-400">記事がまだありません</p>
            <p className="text-sm text-slate-400">近日公開予定です。お楽しみに！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <div className="flex items-center gap-1 mb-2">
                          <Tag className="h-3 w-3 text-indigo-400" />
                          <span className="text-xs font-semibold text-indigo-500">
                            {article.category}
                          </span>
                        </div>
                      )}
                      <h2 className="font-black text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    {article.thumbnailUrl && (
                      <div className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.thumbnailUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                    {article.publishedAt && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(article.publishedAt), "yyyy年M月d日", { locale: ja })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="h-3 w-3" />
                      <span>{article.viewCount.toLocaleString()} 閲覧</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
