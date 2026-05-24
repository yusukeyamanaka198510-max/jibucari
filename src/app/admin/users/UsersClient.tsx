"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  SlidersHorizontal,
  X,
  Mail,
  CheckSquare,
  Square,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type {
  AdminUserProfile,
  EducationLevel,
  JobHuntStatus,
} from "@/types/admin";
import { EDUCATION_LEVEL_LABELS, JOB_HUNT_STATUS_LABELS } from "@/types/admin";
import { getUniversityRank } from "@/lib/universityRankings";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type SortKey = "createdAt" | "pdfDownloadCount" | "actionCount" | "resumeCount" | "hensachi";
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

// ── Bulk Email Modal ──────────────────────────────────────────────────────────

type SendStatus = "idle" | "sending" | "success" | "error";

interface BulkEmailResult {
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  errors?: string[];
}

function BulkEmailModal({
  selectedIds,
  selectedUsers,
  onClose,
}: {
  selectedIds: Set<string>;
  selectedUsers: AdminUserProfile[];
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [result, setResult] = useState<BulkEmailResult | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setStatus("sending");
    setErrMsg(null);
    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: Array.from(selectedIds),
          subject,
          body,
        }),
        cache: "no-store",
      });
      const json = (await res.json()) as BulkEmailResult & { error?: string };
      if (!res.ok) {
        setErrMsg(json.error ?? `エラー: ${res.status}`);
        setStatus("error");
        return;
      }
      setResult(json);
      setStatus("success");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "通信エラーが発生しました");
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">一括メール送信</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedIds.size} 名に送信
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* 送信先プレビュー */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 mb-2">送信先（{selectedIds.size} 名）</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-medium"
                >
                  {u.lastName} {u.firstName}
                  <span className="text-slate-400">({u.email})</span>
                </span>
              ))}
            </div>
          </div>

          {status === "success" && result ? (
            /* 送信結果 */
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">送信完了</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    {result.totalRecipients} 名中 <span className="font-bold">{result.sentCount} 名</span> に送信しました
                    {result.failedCount > 0 && (
                      <span className="text-red-600 ml-1">（{result.failedCount} 名失敗）</span>
                    )}
                  </p>
                </div>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-600 mb-2">送信エラー詳細</p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600 font-mono">{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          ) : (
            /* 送信フォーム */
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={status === "sending"}
                  placeholder="件名を入力..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  本文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  disabled={status === "sending"}
                  rows={10}
                  placeholder={"本文を入力...\n\n※ {{name}} で宛名、{{email}} でメールアドレスを差し込めます"}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none disabled:opacity-60 font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">
                  差し込み変数: <code className="bg-slate-100 px-1 py-0.5 rounded">&#123;&#123;name&#125;&#125;</code> = 氏名、<code className="bg-slate-100 px-1 py-0.5 rounded">&#123;&#123;email&#125;&#125;</code> = メールアドレス
                </p>
              </div>

              {status === "error" && errMsg && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{errMsg}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === "sending"}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={status === "sending" || !subject.trim() || !body.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {status === "sending" ? "送信中..." : `${selectedIds.size} 名に送信`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
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

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const prevDataRef = useRef<AdminUserProfile[]>([]);

  // Deselect when page changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, query, educationLevel, jobHuntStatus, prefecture, gender, ageMin, ageMax, tag]);

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
      prevDataRef.current = json.data;
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

  // Selection helpers
  const allCurrentIds = data.map((u) => u.id);
  const allSelected = allCurrentIds.length > 0 && allCurrentIds.every((id) => selectedIds.has(id));
  const someSelected = allCurrentIds.some((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Collect full user objects for selected IDs (across pages we've seen)
  const selectedUsers = data.filter((u) => selectedIds.has(u.id));

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

        {/* Bulk select / email */}
        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm"
          >
            <Mail className="w-4 h-4" />
            {selectedIds.size} 名にメール送信
          </button>
        )}

        <p className="text-sm text-slate-500 ml-auto shrink-0">
          {selectedIds.size > 0 && (
            <span className="mr-2 text-indigo-600 font-bold">{selectedIds.size} 名選択中</span>
          )}
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
                  {/* Checkbox column */}
                  <th className="pl-4 pr-2 py-3 w-10">
                    <button
                      type="button"
                      onClick={toggleAll}
                      title={allSelected ? "全て解除" : "全て選択"}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : someSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-300" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  {th("名前 / メール")}
                  {th("学歴")}
                  {th("大学名 / 偏差値", "hensachi")}
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
                    <td colSpan={11} className="text-center py-16 text-slate-400 text-sm">
                      該当するユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  data.map((user) => {
                    const isSelected = selectedIds.has(user.id);
                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50/70"}`}
                      >
                        {/* Checkbox */}
                        <td className="pl-4 pr-2 py-4 w-10">
                          <button
                            type="button"
                            onClick={() => toggleOne(user.id)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
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
                          {user.educationLevel ? (EDUCATION_LEVEL_LABELS[user.educationLevel] ?? "—") : "—"}
                        </td>
                        <td className="px-4 py-4">
                          {user.universityName ? (
                            <div>
                              <p className="text-sm text-slate-700">{user.universityName}</p>
                              {getUniversityRank(user.universityName) !== null && (
                                <span className="text-xs text-indigo-600 font-semibold">#{getUniversityRank(user.universityName)}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
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
                    );
                  })
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

      {/* Bulk Email Modal */}
      {showEmailModal && (
        <BulkEmailModal
          selectedIds={selectedIds}
          selectedUsers={selectedUsers}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
