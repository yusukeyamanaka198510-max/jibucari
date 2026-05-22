"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  AdminUserProfile,
  EducationLevel,
  JobHuntStatus,
} from "@/types/admin";
import { EDUCATION_LEVEL_LABELS, JOB_HUNT_STATUS_LABELS } from "@/types/admin";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type SortKey = "createdAt" | "pdfDownloadCount" | "actionCount" | "resumeCount";
type SortDir = "asc" | "desc";

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-100" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-slate-50 last:border-0">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-4 bg-slate-200 rounded w-24 ml-auto" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-12" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const PER_PAGE = 20;

interface ApiResponse {
  data: AdminUserProfile[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function UsersClient() {
  // Filters
  const [query, setQuery] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel | "">("");
  const [jobHuntStatus, setJobHuntStatus] = useState<JobHuntStatus | "">("");
  const [prefecture, setPrefecture] = useState("");
  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [tag, setTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [page, setPage] = useState(1);

  // Data
  const [data, setData] = useState<AdminUserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const handleSort = (key: SortKey) => {
    if (key === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnavailable(false);

    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (educationLevel) params.set("educationLevel", educationLevel);
    if (jobHuntStatus) params.set("jobHuntStatus", jobHuntStatus);
    if (prefecture) params.set("prefecture", prefecture);
    if (gender) params.set("gender", gender);
    if (ageMin) params.set("ageMin", ageMin);
    if (ageMax) params.set("ageMax", ageMax);
    if (tag) params.set("tag", tag);
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("page", String(page));
    params.set("perPage", String(PER_PAGE));

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.status === 503) {
        setUnavailable(true);
        return;
      }
      if (!res.ok) {
        setError(`エラー: ${res.status}`);
        return;
      }
      const json = (await res.json()) as ApiResponse;
      setData(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [query, educationLevel, jobHuntStatus, prefecture, gender, ageMin, ageMax, tag, sortBy, sortDir, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Reset page when filters change
  const resetPage = () => setPage(1);

  const th = (label: string, key?: SortKey) => (
    <th
      className={`px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${key ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
      onClick={key ? () => handleSort(key) : undefined}
    >
      <span className="flex items-center gap-1.5">
        {label}
        {key && <SortIcon active={sortBy === key} dir={sortDir} />}
      </span>
    </th>
  );

  const activeFilterCount = [educationLevel, jobHuntStatus, prefecture, gender, ageMin, ageMax, tag].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder="名前・メールで検索..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          フィルター
          {activeFilterCount > 0 && (
            <span className="bg-indigo-600 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <p className="text-sm text-slate-500 ml-auto shrink-0">
          <span className="font-semibold text-slate-800">{total}</span> 件
        </p>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">学歴</label>
            <select
              value={educationLevel}
              onChange={(e) => { setEducationLevel(e.target.value as EducationLevel | ""); resetPage(); }}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">すべて</option>
              {(Object.entries(EDUCATION_LEVEL_LABELS) as [EducationLevel, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">求職状況</label>
            <select
              value={jobHuntStatus}
              onChange={(e) => { setJobHuntStatus(e.target.value as JobHuntStatus | ""); resetPage(); }}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">すべて</option>
              {(Object.entries(JOB_HUNT_STATUS_LABELS) as [JobHuntStatus, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">性別</label>
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); resetPage(); }}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">すべて</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">都道府県</label>
            <input
              type="text"
              value={prefecture}
              onChange={(e) => { setPrefecture(e.target.value); resetPage(); }}
              placeholder="例: 東京都"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">年齢（最小）</label>
            <input
              type="number"
              value={ageMin}
              onChange={(e) => { setAgeMin(e.target.value); resetPage(); }}
              placeholder="18"
              min={0}
              max={100}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">年齢（最大）</label>
            <input
              type="number"
              value={ageMax}
              onChange={(e) => { setAgeMax(e.target.value); resetPage(); }}
              placeholder="65"
              min={0}
              max={100}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">タグ</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => { setTag(e.target.value); resetPage(); }}
              placeholder="例: VIP"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setEducationLevel("");
                setJobHuntStatus("");
                setGender("");
                setPrefecture("");
                setAgeMin("");
                setAgeMax("");
                setTag("");
                resetPage();
              }}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors font-medium"
            >
              <X className="w-3.5 h-3.5" />
              クリア
            </button>
          </div>
        </div>
      )}

      {/* Unavailable */}
      {unavailable && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          Supabase未接続のため表示できません
        </div>
      )}

      {/* Error */}
      {error && !unavailable && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : !unavailable && !error && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {th("名前 / メール")}
                  {th("学歴")}
                  {th("求職状況")}
                  {th("都道府県")}
                  {th("登録日", "createdAt")}
                  {th("履歴書", "resumeCount")}
                  {th("PDF数", "pdfDownloadCount")}
                  {th("アクション数", "actionCount")}
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400 text-sm">
                      該当するユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  data.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {user.lastName} {user.firstName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {user.educationLevel ? (EDUCATION_LEVEL_LABELS[user.educationLevel] ?? "—") : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {user.jobHuntStatus ? (JOB_HUNT_STATUS_LABELS[user.jobHuntStatus] ?? "—") : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {user.prefecture || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 font-bold">
                        {user.resumeCount}
                      </td>
                      <td className="px-4 py-4 text-sm text-indigo-600 font-bold">
                        {user.pdfDownloadCount}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 font-bold">
                        {user.actionCount}
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
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} / {total}件
              </p>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← 前へ
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
                  return (
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
                  );
                })}
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
      )}
    </div>
  );
}
