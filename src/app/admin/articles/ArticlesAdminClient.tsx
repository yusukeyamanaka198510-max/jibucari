"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Article } from "@/types/article";

interface Props {
  articles: Article[];
}

export function ArticlesAdminClient({ articles: initialArticles }: Props) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleTogglePublish = async (article: Article) => {
    setTogglingId(article.id);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !article.published }),
      });
      if (res.ok) {
        const updated: Article = await res.json();
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? updated : a))
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setConfirmDeleteId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 新規作成ボタン */}
      <div className="flex justify-end">
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          新規作成
        </Link>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-200" />
            <p className="font-semibold text-slate-400">記事がありません</p>
            <Link
              href="/admin/articles/new"
              className="text-sm text-indigo-600 underline hover:text-indigo-800 transition-colors"
            >
              最初の記事を作成する
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    カテゴリ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    状態
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    閲覧数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    更新日
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{article.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {article.category ? (
                        <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {article.category}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          article.published
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {article.published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            公開中
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            下書き
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {article.viewCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {format(new Date(article.updatedAt), "M月d日", { locale: ja })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* 公開切り替え */}
                        <button
                          onClick={() => handleTogglePublish(article)}
                          disabled={togglingId === article.id}
                          title={article.published ? "非公開にする" : "公開する"}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                            article.published
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {article.published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        {/* 編集 */}
                        <button
                          onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                          className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors"
                          title="編集"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* 削除 */}
                        <button
                          onClick={() => setConfirmDeleteId(article.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">記事を削除しますか？</h3>
                <p className="text-xs text-slate-500 mt-0.5">この操作は取り消せません</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              「
              <span className="font-semibold">
                {articles.find((a) => a.id === confirmDeleteId)?.title}
              </span>
              」を完全に削除します。
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
