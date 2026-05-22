"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, AlertTriangle } from "lucide-react";
import type { EmailCampaignRow, EmailSendLogRow, CampaignStatus } from "@/types/admin";

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

const SEND_LOG_STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  bounced: "bg-amber-100 text-amber-700",
};

// ── Confirm dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  recipientCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  sending: boolean;
}

function ConfirmDialog({ recipientCount, onConfirm, onCancel, sending }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-base font-black text-slate-900">送信確認</h2>
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-bold text-slate-900">{recipientCount}名</span> にメールを送信します。
          この操作は取り消せません。実行しますか？
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={sending}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? "送信中..." : "送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ApiResponse {
  data: {
    campaign: EmailCampaignRow;
    sendLogs: EmailSendLogRow[];
  };
}

interface Props {
  id: string;
}

export function CampaignDetailClient({ id }: Props) {
  const [campaign, setCampaign] = useState<EmailCampaignRow | null>(null);
  const [sendLogs, setSendLogs] = useState<EmailSendLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnavailable(false);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { cache: "no-store" });
      if (res.status === 503) { setUnavailable(true); return; }
      if (!res.ok) { setError(`エラー: ${res.status}`); return; }
      const json = (await res.json()) as ApiResponse;
      setCampaign(json.data.campaign);
      setSendLogs(json.data.sendLogs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleSend = async () => {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setShowConfirm(false);
      await fetchData();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "送信エラーが発生しました");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="bg-white rounded-2xl border border-slate-100 h-64" />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          Supabase未接続のため表示できません
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          {error ?? "データを取得できませんでした"}
        </div>
      </div>
    );
  }

  const filterEntries = Object.entries(campaign.filterConditions ?? {}).filter(([, v]) => Boolean(v));

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/campaigns"
          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          キャンペーン
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold truncate max-w-xs">{campaign.subject}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{campaign.subject}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_COLORS[campaign.status]}`}>
                {STATUS_LABELS[campaign.status]}
              </span>
              <span className="text-xs text-slate-400">送信数: {campaign.recipientCount}名</span>
            </div>
          </div>
        </div>

        {campaign.status === "draft" && (
          <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            送信する
          </button>
        )}
      </div>

      {sendError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          {sendError}
        </div>
      )}

      {/* Campaign detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Meta */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">キャンペーン情報</p>
          <div className="space-y-3">
            {[
              { label: "作成日",   value: fmtDateTime(campaign.createdAt) },
              { label: "更新日",   value: fmtDateTime(campaign.updatedAt) },
              { label: "予約日時", value: fmtDateTime(campaign.scheduledAt) },
              { label: "送信日時", value: fmtDateTime(campaign.sentAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {filterEntries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">フィルター条件</p>
              <div className="space-y-1.5">
                {filterEntries.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-semibold text-slate-700">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">本文プレビュー</p>
          <div
            className="text-sm text-slate-700 border border-slate-100 rounded-xl p-4 bg-slate-50 overflow-auto max-h-64"
            dangerouslySetInnerHTML={{ __html: campaign.bodyHtml }}
          />
        </div>
      </div>

      {/* Send logs */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-700">送信ログ ({sendLogs.length}件)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">メールアドレス</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">送信日時</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">エラー</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sendLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                    送信ログがありません
                  </td>
                </tr>
              ) : (
                sendLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{log.toEmail}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${SEND_LOG_STATUS_COLORS[log.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {fmtDateTime(log.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {log.errorMsg ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          recipientCount={campaign.recipientCount}
          onConfirm={handleSend}
          onCancel={() => setShowConfirm(false)}
          sending={sending}
        />
      )}
    </div>
  );
}
