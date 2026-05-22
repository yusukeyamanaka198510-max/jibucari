"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";

export type ChartType = "user_trend" | "access_trend" | "education_trend";
type Granularity = "daily" | "monthly";

interface ChartDetailModalProps {
  chart: ChartType | null;
  onClose: () => void;
}

// ── タイプ定義 ────────────────────────────────────────────────────────────────

interface SimplePoint {
  date: string;
  count: number;
  cumulative: number;
}

interface AccessPoint {
  date: string;
  pdf_download: number;
  pdf_email: number;
  interview_request: number;
  resume_created: number;
  resume_updated: number;
  total: number;
}

interface EduPoint {
  date: string;
  byEducation: Record<string, number>;
  total: number;
}

const CHART_CONFIG: Record<ChartType, { title: string; subtitle: string }> = {
  user_trend:       { title: "ユーザー数の推移",   subtitle: "新規登録ユーザー数" },
  access_trend:     { title: "アクセス数の推移",   subtitle: "アクション種別ごとの件数" },
  education_trend:  { title: "学歴別セグメント",   subtitle: "期間別の新規登録内訳" },
};

const ACCESS_COLORS: Record<string, string> = {
  pdf_download:      "#6366f1",
  pdf_email:         "#a855f7",
  interview_request: "#f59e0b",
  resume_created:    "#10b981",
  resume_updated:    "#3b82f6",
};

const ACCESS_LABELS: Record<string, string> = {
  pdf_download:      "PDF書き出し",
  pdf_email:         "メール転送",
  interview_request: "面談リクエスト",
  resume_created:    "履歴書作成",
  resume_updated:    "履歴書更新",
};

const EDU_COLORS = [
  "#6366f1","#a855f7","#10b981","#f59e0b","#3b82f6","#ef4444","#14b8a6","#f97316",
];

// ── 軸ラベルフォーマット ────────────────────────────────────────────────────

function fmtDate(d: string, granularity: Granularity): string {
  if (granularity === "monthly") {
    const mo = d.split("-")[1] ?? "0";
    return `${parseInt(mo)}月`;
  }
  const parts = d.split("-");
  return `${parts[1] ?? ""}/${parts[2] ?? ""}`;
}

// ── SVGユーティリティ ─────────────────────────────────────────────────────────

const PAD = { top: 16, right: 8, bottom: 32, left: 36 };
const VW = 520;
const VH = 180;

function yTicks(max: number): number[] {
  if (max === 0) return [0];
  const step = Math.ceil(max / 4);
  return [0, step, step * 2, step * 3, step * 4];
}

function barX(i: number, total: number): number {
  const w = VW - PAD.left - PAD.right;
  const slot = w / total;
  return PAD.left + i * slot + slot * 0.15;
}

function barW(total: number): number {
  const w = VW - PAD.left - PAD.right;
  return (w / total) * 0.7;
}

// ── ユーザー数チャート（単色棒グラフ） ───────────────────────────────────────

function UserTrendSvg({ data, granularity }: { data: SimplePoint[]; granularity: Granularity }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const ticks = yTicks(max);
  const chartH = VH - PAD.top - PAD.bottom;
  const chartW = VW - PAD.left - PAD.right;
  const every = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-44">
      {/* y-axis ticks */}
      {ticks.map((t) => {
        const y = PAD.top + chartH - (t / (ticks[ticks.length - 1] ?? 1)) * chartH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={VW - PAD.right} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{t}</text>
          </g>
        );
      })}
      {/* bars */}
      {data.map((d, i) => {
        const h = Math.max((d.count / (ticks[ticks.length - 1] ?? 1)) * chartH, d.count > 0 ? 2 : 0);
        const x = barX(i, data.length);
        const w = barW(data.length);
        const y = PAD.top + chartH - h;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={w} height={h} fill="#a5b4fc" rx={2} />
            {i % every === 0 && (
              <text x={x + w / 2} y={VH - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {fmtDate(d.date, granularity)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── アクセス数チャート（スタック棒グラフ） ─────────────────────────────────────

const ACCESS_KEYS = ["pdf_download", "pdf_email", "interview_request", "resume_created", "resume_updated"] as const;

function AccessTrendSvg({ data, granularity }: { data: AccessPoint[]; granularity: Granularity }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const ticks = yTicks(max);
  const topTick = ticks[ticks.length - 1] ?? 1;
  const chartH = VH - PAD.top - PAD.bottom;
  const every = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-44">
      {ticks.map((t) => {
        const y = PAD.top + chartH - (t / topTick) * chartH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={VW - PAD.right} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{t}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = barX(i, data.length);
        const w = barW(data.length);
        let stackY = PAD.top + chartH;
        return (
          <g key={d.date}>
            {ACCESS_KEYS.map((key) => {
              const val = d[key];
              if (val === 0) return null;
              const h = (val / topTick) * chartH;
              stackY -= h;
              const color = ACCESS_COLORS[key] ?? "#6366f1";
              return <rect key={key} x={x} y={stackY} width={w} height={h} fill={color} />;
            })}
            {i % every === 0 && (
              <text x={x + w / 2} y={VH - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {fmtDate(d.date, granularity)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── 学歴別チャート（スタック棒グラフ） ──────────────────────────────────────

function EduTrendSvg({ data, eduKeys, granularity }: { data: EduPoint[]; eduKeys: string[]; granularity: Granularity }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const ticks = yTicks(max);
  const topTick = ticks[ticks.length - 1] ?? 1;
  const chartH = VH - PAD.top - PAD.bottom;
  const every = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-44">
      {ticks.map((t) => {
        const y = PAD.top + chartH - (t / topTick) * chartH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={VW - PAD.right} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{t}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = barX(i, data.length);
        const w = barW(data.length);
        let stackY = PAD.top + chartH;
        return (
          <g key={d.date}>
            {eduKeys.map((edu, ei) => {
              const val = d.byEducation[edu] ?? 0;
              if (val === 0) return null;
              const h = (val / topTick) * chartH;
              stackY -= h;
              const color = EDU_COLORS[ei % EDU_COLORS.length] ?? "#6366f1";
              return <rect key={edu} x={x} y={stackY} width={w} height={h} fill={color} />;
            })}
            {i % every === 0 && (
              <text x={x + w / 2} y={VH - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {fmtDate(d.date, granularity)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── サマリーテーブル ────────────────────────────────────────────────────────

function SummaryTable({ dates, counts }: { dates: string[]; counts: number[] }) {
  return (
    <div className="overflow-auto max-h-48">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-600">期間</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-600">件数</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-600">前期比</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[...dates].reverse().map((date, ri) => {
            const idx = dates.length - 1 - ri;
            const count = counts[idx] ?? 0;
            const prev = counts[idx - 1];
            const diff = prev !== undefined ? count - prev : null;
            return (
              <tr key={date} className="hover:bg-slate-50">
                <td className="px-3 py-1.5 text-slate-700">{date}</td>
                <td className="px-3 py-1.5 text-right font-medium text-slate-900">{count.toLocaleString()}</td>
                <td className={`px-3 py-1.5 text-right font-medium ${diff === null ? "text-slate-300" : diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-500" : "text-slate-400"}`}>
                  {diff === null ? "—" : diff > 0 ? `+${diff}` : `${diff}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── メインモーダル ────────────────────────────────────────────────────────────

export function ChartDetailModal({ chart, onClose }: ChartDetailModalProps) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // データ状態
  const [simpleData, setSimpleData]   = useState<SimplePoint[]>([]);
  const [accessData, setAccessData]   = useState<AccessPoint[]>([]);
  const [eduData, setEduData]         = useState<EduPoint[]>([]);
  const [eduKeys, setEduKeys]         = useState<string[]>([]);

  const fetchData = useCallback(async (g: Granularity) => {
    if (!chart) return;
    setLoading(true);
    setError(null);
    try {
      if (chart === "user_trend") {
        const days = g === "daily" ? 30 : undefined;
        const qs = new URLSearchParams({ metric: "users", granularity: g, ...(days ? { days: String(days) } : {}) });
        const res = await fetch(`/api/admin/stats/timeseries?${qs}`);
        const json = await res.json() as { data?: SimplePoint[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "エラー");
        setSimpleData(json.data ?? []);
      } else if (chart === "access_trend") {
        const days = g === "daily" ? 30 : undefined;
        const qs = new URLSearchParams({ metric: "access_breakdown", granularity: g, ...(days ? { days: String(days) } : {}) });
        const res = await fetch(`/api/admin/stats/breakdown?${qs}`);
        const json = await res.json() as { data?: AccessPoint[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "エラー");
        setAccessData(json.data ?? []);
      } else {
        const days = g === "daily" ? 30 : undefined;
        const qs = new URLSearchParams({ metric: "education_trend", granularity: g, ...(days ? { days: String(days) } : {}) });
        const res = await fetch(`/api/admin/stats/breakdown?${qs}`);
        const json = await res.json() as { data?: EduPoint[]; educationKeys?: string[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "エラー");
        setEduData(json.data ?? []);
        setEduKeys(json.educationKeys ?? []);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [chart]);

  useEffect(() => {
    if (chart) {
      setGranularity("monthly");
      fetchData("monthly");
    }
  }, [chart, fetchData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!chart) return null;

  const cfg = CHART_CONFIG[chart];

  const handleGranularity = (g: Granularity) => {
    setGranularity(g);
    fetchData(g);
  };

  // サマリーテーブル用データ
  const summaryDates  = chart === "user_trend" ? simpleData.map((d) => d.date)
                      : chart === "access_trend" ? accessData.map((d) => d.date)
                      : eduData.map((d) => d.date);
  const summaryCounts = chart === "user_trend" ? simpleData.map((d) => d.count)
                      : chart === "access_trend" ? accessData.map((d) => d.total)
                      : eduData.map((d) => d.total);

  const isEmpty = summaryCounts.every((c) => c === 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-base">{cfg.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{cfg.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Granularity tabs */}
        <div className="px-6 pt-4 flex gap-2">
          {(["daily", "monthly"] as const).map((g) => (
            <button
              key={g}
              onClick={() => handleGranularity(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                granularity === g
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {g === "daily" ? "日次（30日）" : "月次（12ヶ月）"}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div className="px-6 pt-4">
          {loading ? (
            <div className="h-44 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : error ? (
            <div className="h-44 flex items-center justify-center">
              <p className="text-sm text-slate-400">データを取得できませんでした</p>
            </div>
          ) : isEmpty ? (
            <div className="h-44 flex items-center justify-center">
              <p className="text-sm text-slate-400">データがありません</p>
            </div>
          ) : chart === "user_trend" ? (
            <UserTrendSvg data={simpleData} granularity={granularity} />
          ) : chart === "access_trend" ? (
            <>
              <AccessTrendSvg data={accessData} granularity={granularity} />
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-1 pb-1">
                {ACCESS_KEYS.map((k) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: ACCESS_COLORS[k] }} />
                    <span className="text-xs text-slate-500">{ACCESS_LABELS[k]}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <EduTrendSvg data={eduData} eduKeys={eduKeys} granularity={granularity} />
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-1 pb-1">
                {eduKeys.map((edu, i) => (
                  <div key={edu} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: EDU_COLORS[i % EDU_COLORS.length] }} />
                    <span className="text-xs text-slate-500">{edu}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary table */}
        {!loading && !error && !isEmpty && (
          <div className="px-6 pb-6 mt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">期間別サマリー</p>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <SummaryTable dates={summaryDates} counts={summaryCounts} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
