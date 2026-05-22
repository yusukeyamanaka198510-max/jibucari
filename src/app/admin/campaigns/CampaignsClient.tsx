"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Plus, X, ExternalLink } from "lucide-react";
import type {
  EmailCampaignRow,
  CampaignStatus,
  EducationLevel,
  JobHuntStatus,
} from "@/types/admin";
import { EDUCATION_LEVEL_LABELS, JOB_HUNT_STATUS_LABELS } from "@/types/admin";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "下書き",
  sending: "送信中",
  sent: "送信済",
  failed: "失敗",
};

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-100" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-slate-50 last:border-0">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
          <div className="h-4 bg-slate-200 rounded w-12" />
          <div className="h-4 bg-slate-200 rounded w-28" />
        </div>
      ))}
    </div>
  );
}

// ── Create campaign modal ─────────────────────────────────────────────────────

interface FilterConditions {
  educationLevel?: EducationLevel | "";
  jobHuntStatus?: JobHuntStatus | "";
  prefecture?: string;
  gender?: string;
}

interface CreateModalProps {
  onClose: () => void;
  onCreated: (campaign: EmailCampaignRow) => void;
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [filters, setFilters] = useState<FilterConditions>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !bodyHtml.trim()) return;
    setSubmitting(true);
    setError(null);

    const filterConditions: Record<string, unknown> = {};
    if (filters.educationLevel) filterConditions.educationLevel = filters.educationLevel;
    if (filters.jobHuntStatus) filterConditions.jobHuntStatus = filters.jobHuntStatus;
    if (filters.prefecture) filterConditions.prefecture = filters.prefecture;
    if (filters.gender) filterConditions.gender = filters.gender;

    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          bodyHtml,
          filterConditions: Object.keys(filterConditions).length > 0 ? filterConditions : undefined,
          scheduledAt: scheduledAt || undefined,
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = (await res.json()) as { data: EmailCampaignRow };
      onCreated(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">新規キャンペーン</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">件名 *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="メールの件名"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">本文 (HTML) *</label>
            <p className="text-xs text-slate-400 mb-2">
              テンプレート変数: <code className="bg-slate-100 px-1 rounded">{"{{name}}"}</code> 氏名, <code className="bg-slate-100 px-1 rounded">{"{{email}}"}</code> メール
            </p>
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              required
              rows={8}
              placeholder={"<p>{{name}} 様</p>\n<p>いつもジブキャリをご利用いただきありがとうございます。</p>"}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono resize-none"
            />
          </div>

          {/* Filter conditions */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3">送信対象フィルター（任意）</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">学歴</label>
                <select
                  value={filters.educationLevel ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, educationLevel: e.target.value as EducationLevel | "" }))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">すべて</option>
                  {(Object.entries(EDUCATION_LEVEL_LABELS) as [EducationLevel, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">求職状況</label>
                <select
                  value={filters.jobHuntStatus ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, jobHuntStatus: e.target.value as JobHuntStatus | "" }))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">すべて</option>
                  {(Object.entries(JOB_HUNT_STATUS_LABELS) as [JobHuntStatus, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">性別</label>
                <select
                  value={filters.gender ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">すべて</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">都道府県</label>
                <input
                  type="text"
                  value={filters.prefecture ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, prefecture: e.target.value }))}
                  placeholder="例: 東京都"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">送信予約日時（任意）</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !bodyHtml.trim()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            >
              {submitting ? "保存中..." : "下書きとして保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const STATUS_TABS: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all",     label: "すべて" },
  { value: "draft",   label: "下書き" },
  { value: "sending", label: "送信中" },
  { value: "sent",    label: "送信済" },
  { value: "failed",  label: "失敗"   },
];

interface ApiResponse {
  data: EmailCampaignRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PER_PAGE = 20;

export function CampaignsClient() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<EmailCampaignRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnavailable(false);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("perPage", String(PER_PAGE));
    try {
      const res = await fetch(`/api/admin/campaigns?${params.toString()}`, { cache: "no-store" });
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
  }, [statusFilter, page]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleCreated = (campaign: EmailCampaignRow) => {
    setShowModal(false);
    setData((prev) => [campaign, ...prev]);
    setTotal((t) => t + 1);
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">キャンペーン</h1>
            <p className="text-sm text-slate-500">メール配信キャンペーンを管理できます</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規キャンペーン
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === value
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">件名</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">送信数</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">予約日時</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">送信日時</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">作成日</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                      キャンペーンがありません
                    </td>
                  </tr>
                ) : (
                  data.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{c.subject}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 font-bold">
                        {c.recipientCount}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {fmtDateTime(c.scheduledAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {fmtDateTime(c.sentAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {fmtDateTime(c.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/campaigns/${c.id}`}
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

      {/* Create modal */}
      {showModal && (
        <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
