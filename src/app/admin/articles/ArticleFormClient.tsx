"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, ArrowLeft, Loader2, X } from "lucide-react";
import type { Article } from "@/types/article";

const CATEGORIES = [
  "履歴書の書き方",
  "転職ノウハウ",
  "自己PR・志望動機",
  "面接対策",
  "AI活用法",
  "その他",
];

function generateDefaultSlug(): string {
  const now = new Date();
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `article-${yyyymmdd}-${rand}`;
}

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface FormState {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  published: boolean;
}

interface Props {
  article?: Article;
}

export function ArticleFormClient({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;

  const [form, setForm] = useState<FormState>({
    title: article?.title ?? "",
    slug: article?.slug ?? generateDefaultSlug(),
    category: article?.category ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    published: article?.published ?? false,
  });
  const [slugManual, setSlugManual] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // タイトルからスラグを自動生成（手動上書きしていない場合）
  useEffect(() => {
    if (!slugManual && !isEdit) {
      // タイトルが空の場合はデフォルト形式を維持
      if (form.title.trim() === "") return;
      const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setForm((f) => ({ ...f, slug: `article-${yyyymmdd}-${rand}` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  const handleSlugChange = (v: string) => {
    setSlugManual(true);
    setForm((f) => ({ ...f, slug: sanitizeSlug(v) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!form.slug.trim()) {
      setError("スラグを入力してください");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/articles/${article!.id}`
        : "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          category: form.category || null,
          excerpt: form.excerpt,
          content: form.content,
          published: form.published,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "保存に失敗しました");
        return;
      }

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const previewParagraphs = form.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/articles")}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="記事一覧へ戻る"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {isEdit ? "記事を編集" : "新規記事作成"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEdit ? `スラグ: ${article!.slug}` : "新しい記事を作成します"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン */}
          <div className="lg:col-span-2 space-y-4">
            {/* タイトル */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  タイトル <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="記事のタイトルを入力"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                />
              </div>

              {/* スラグ */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  スラグ（URL）<span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap">/articles/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="article-20240101-001"
                    required
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  英小文字・数字・ハイフンのみ使用可
                </p>
              </div>

              {/* 概要 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">概要（excerpt）</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="記事の簡単な説明（一覧ページに表示）"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300 resize-none"
                />
              </div>
            </div>

            {/* 本文 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600">本文</label>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  プレビュー
                </button>
              </div>
              <textarea
                rows={20}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder={"本文を入力してください。\n\n段落は空行で区切ります。\n\n改行は \\n で表現されます。"}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300 resize-y font-mono leading-relaxed"
              />
              <p className="text-xs text-slate-400">空行で段落を分けます。</p>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-4">
            {/* 公開設定 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">公開設定</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      form.published ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        form.published ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                  {form.published ? "公開中" : "下書き"}
                </span>
              </label>
              {form.published && (
                <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  保存後すぐに公開されます
                </p>
              )}
            </div>

            {/* カテゴリ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-700">カテゴリ</h3>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">未選択</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 保存ボタン */}
            <div className="space-y-2">
              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-50 text-sm shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? "更新する" : "作成する"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* プレビューモーダル */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-sm">プレビュー</h3>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {form.category && (
                <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {form.category}
                </span>
              )}
              <h1 className="text-xl font-black text-slate-900">
                {form.title || "（タイトルなし）"}
              </h1>
              {form.excerpt && (
                <p className="text-sm text-slate-500 leading-relaxed">{form.excerpt}</p>
              )}
              <hr className="border-slate-100" />
              <div className="space-y-4">
                {previewParagraphs.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">（本文がありません）</p>
                ) : (
                  previewParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
                    >
                      {para}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
