"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Download, Mail, MessageSquare, ExternalLink } from "lucide-react";
import type { AdminUser } from "@/lib/adminMockData";

type SortKey = "pdfDownloadCount" | "pdfEmailCount" | "interviewButtonCount" | "registeredAt";
type SortDir = "asc" | "desc";

const FORMAT_LABELS: Record<string, string> = {
  jis: "JIS",
  career_change: "転職",
  new_graduate: "新卒",
  part_time: "バイト",
};

function SortIcon({ col, active, dir }: { col: string; active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
}

interface Props {
  users: AdminUser[];
}

const PAGE_SIZE = 10;

export function UsersClient({ users }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d: SortDir) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) =>
      !q ||
      `${u.lastName}${u.firstName}`.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.includes(q)
    );
  }, [users, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortKey === "registeredAt") {
        return mult * (new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
      }
      return mult * (a[sortKey] - b[sortKey]);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const th = (label: string, key?: SortKey) => (
    <th
      className={`px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${key ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
      onClick={key ? () => handleSort(key) : undefined}
    >
      <span className="flex items-center gap-1.5">
        {label}
        {key && <SortIcon col={key} active={sortKey === key} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Search + count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="名前・メールで検索..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <p className="text-sm text-slate-500 shrink-0">
          <span className="font-semibold text-slate-800">{sorted.length}</span> 件
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {th("#")}
                {th("ユーザーID")}
                {th("氏名")}
                {th("登録日", "registeredAt")}
                {th("PDF書き出し", "pdfDownloadCount")}
                {th("メール転送", "pdfEmailCount")}
                {th("面談リクエスト", "interviewButtonCount")}
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                    該当するユーザーが見つかりません
                  </td>
                </tr>
              ) : (
                paged.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-400 font-medium">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {user.lastName} {user.firstName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(user.registeredAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span
                          className={`text-sm font-bold ${
                            user.pdfDownloadCount >= 10
                              ? "text-indigo-600"
                              : "text-slate-700"
                          }`}
                        >
                          {user.pdfDownloadCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span
                          className={`text-sm font-bold ${
                            user.pdfEmailCount >= 5
                              ? "text-violet-600"
                              : "text-slate-700"
                          }`}
                        >
                          {user.pdfEmailCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span
                          className={`text-sm font-bold ${
                            user.interviewButtonCount >= 5
                              ? "text-amber-600"
                              : "text-slate-700"
                          }`}
                        >
                          {user.interviewButtonCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} / {sorted.length}件
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← 前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                次へ →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
