"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { AdminOperationLogRow } from "@/types/admin";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const OPERATION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  send:   "bg-indigo-100 text-indigo-700",
};

function OperationBadge({ type }: { type: string }) {
  const color = OPERATION_COLORS[type.toLowerCase()] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${color}`}>
      {type}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-100" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-slate-50 last:border-0">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-48 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type TargetTypeFilter = "all" | "article" | "user" | "campaign";

const TARGET_TABS: { value: TargetTypeFilter; label: string }[] = [
  { value: "all",      label: "すべて"     },
  { value: "article",  label: "記事"       },
  { value: "user",     label: "ユーザー"   },
  { value: "campaign", label: "キャンペーン" },
];

interface ApiResponse {
  data: AdminOperationLogRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PER_PAGE = 20;

export function OperationLogsClient() {
  const [targetType, setTargetType] = useState<TargetTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminOperationLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnavailable(false);
    const params = new URLSearchParams();
    if (targetType !== "all") params.set("targetType", targetType);
    params.set("page", String(page));
    params.set("perPage", String(PER_PAGE));
    try {
      const res = await fetch(`/api/admin/operation-logs?${params.toString()}`, { cache: "no-store" });
      if (res.status === 503) { setUnavailable(true); return; }
      if (!res.ok) { setError(`エラー: ${res.status}`); return; }
      const json = (await res.json()) as ApiResponse;
      setData(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [targetType, page]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">操作ログ</h1>
          <p className="text-sm text-slate-500">管理者の操作履歴を確認できます</p>
        </div>
      </div>

      {/* Target type filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TARGET_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setTargetType(value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              targetType === value
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">日時</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">操作種別</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">対象種別</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">概要</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-slate-400 text-sm">
                      操作ログがありません
                    </td>
                  </tr>
                ) : (
                  data.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {fmtDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <OperationBadge type={log.operationType} />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {log.targetType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {log.summary ?? "—"}
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
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← 前へ
                </button>
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
