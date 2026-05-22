"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import type { TimeSeriesDataPoint } from "@/app/api/admin/stats/timeseries/route";

type Metric = "users" | "resumes" | "pdf_download" | "pdf_email" | "interview_request";
type Granularity = "daily" | "monthly";

export interface StatDetailModalProps {
  metric: Metric | null;
  label: string;
  onClose: () => void;
}

const DAYS_OPTIONS: Record<Granularity, number> = {
  daily: 30,
  monthly: 365, // not used for monthly granularity query but kept for type safety
};

function formatDateLabel(date: string, granularity: Granularity): string {
  if (granularity === "monthly") {
    // "2024-03" → "3月"
    const parts = date.split("-");
    return `${parts[1] ?? ""}月`;
  }
  // "2024-03-15" → "3/15"
  const parts = date.split("-");
  return `${parts[1] ?? ""}/${parts[2] ?? ""}`;
}

function formatPeriodFull(date: string, granularity: Granularity): string {
  if (granularity === "monthly") {
    const [year, month] = date.split("-");
    return `${year ?? ""}年${month ?? ""}月`;
  }
  const [year, month, day] = date.split("-");
  return `${year ?? ""}/${month ?? ""}/${day ?? ""}`;
}

// SVG bar chart component
function BarChart({
  data,
  granularity,
}: {
  data: TimeSeriesDataPoint[];
  granularity: Granularity;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round((maxCount * (tickCount - 1 - i)) / (tickCount - 1))
  );

  const chartH = 200;
  const chartPaddingLeft = 48;
  const chartPaddingRight = 8;
  const chartPaddingTop = 12;
  const chartPaddingBottom = 36;
  const totalW = 600;
  const totalH = chartH + chartPaddingTop + chartPaddingBottom;
  const plotW = totalW - chartPaddingLeft - chartPaddingRight;

  const barCount = data.length;
  const barGap = Math.max(1, Math.floor(plotW / barCount / 6));
  const barW = Math.max(2, Math.floor((plotW - barGap * (barCount + 1)) / barCount));

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="w-full"
      aria-label="棒グラフ"
      role="img"
    >
      {/* Y-axis ticks */}
      {ticks.map((tick, i) => {
        const y = chartPaddingTop + (i / (tickCount - 1)) * chartH;
        return (
          <g key={tick}>
            <line
              x1={chartPaddingLeft}
              y1={y}
              x2={totalW - chartPaddingRight}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={chartPaddingLeft - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
            >
              {tick.toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* Bars and x-axis labels */}
      {data.map((point, i) => {
        const barH = maxCount > 0 ? (point.count / maxCount) * chartH : 0;
        const x = chartPaddingLeft + barGap + i * (barW + barGap);
        const y = chartPaddingTop + chartH - barH;

        // Show label every N items to avoid crowding
        const step = granularity === "daily" ? Math.ceil(barCount / 10) : 1;
        const showLabel = i % step === 0 || i === barCount - 1;

        return (
          <g key={point.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill="#6366f1"
              rx="2"
              opacity="0.85"
            >
              <title>{`${formatPeriodFull(point.date, granularity)}: ${point.count.toLocaleString()}件`}</title>
            </rect>
            {showLabel && (
              <text
                x={x + barW / 2}
                y={chartPaddingTop + chartH + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
              >
                {formatDateLabel(point.date, granularity)}
              </text>
            )}
          </g>
        );
      })}

      {/* Axes */}
      <line
        x1={chartPaddingLeft}
        y1={chartPaddingTop}
        x2={chartPaddingLeft}
        y2={chartPaddingTop + chartH}
        stroke="#cbd5e1"
        strokeWidth="1"
      />
      <line
        x1={chartPaddingLeft}
        y1={chartPaddingTop + chartH}
        x2={totalW - chartPaddingRight}
        y2={chartPaddingTop + chartH}
        stroke="#cbd5e1"
        strokeWidth="1"
      />
    </svg>
  );
}

// Summary table
function SummaryTable({
  data,
  granularity,
}: {
  data: TimeSeriesDataPoint[];
  granularity: Granularity;
}) {
  // Show last 12 rows for monthly, last 14 for daily
  const sliceCount = granularity === "monthly" ? 12 : 14;
  const rows = [...data].reverse().slice(0, sliceCount);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">期間</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">件数</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">前期比</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const prevRow = rows[i + 1];
            const prev = prevRow?.count ?? null;
            const diff = prev !== null ? row.count - prev : null;

            return (
              <tr key={row.date} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2 px-3 text-slate-700">
                  {formatPeriodFull(row.date, granularity)}
                </td>
                <td className="py-2 px-3 text-right font-medium text-slate-900">
                  {row.count.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right">
                  {diff === null ? (
                    <span className="text-slate-400">—</span>
                  ) : diff > 0 ? (
                    <span className="text-emerald-600 font-medium">+{diff.toLocaleString()}</span>
                  ) : diff < 0 ? (
                    <span className="text-red-500 font-medium">{diff.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-400">±0</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatDetailModal({ metric, label, onClose }: StatDetailModalProps) {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [data, setData] = useState<TimeSeriesDataPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (g: Granularity) => {
      if (!metric) return;
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const days = g === "daily" ? 30 : 365;
        const res = await fetch(
          `/api/admin/stats/timeseries?metric=${metric}&granularity=${g}&days=${days}`
        );
        if (!res.ok) {
          setError("データを取得できませんでした");
          return;
        }
        const json = (await res.json()) as { data: TimeSeriesDataPoint[] };
        setData(json.data);
      } catch {
        setError("データを取得できませんでした");
      } finally {
        setLoading(false);
      }
    },
    [metric]
  );

  useEffect(() => {
    if (metric) {
      setGranularity("daily");
      void fetchData("daily");
    }
  }, [metric, fetchData]);

  // Escape key to close
  useEffect(() => {
    if (!metric) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [metric, onClose]);

  if (!metric) return null;

  const handleTabChange = (g: Granularity) => {
    setGranularity(g);
    void fetchData(g);
  };

  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`${label} の推移`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {label} の推移
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 px-6 py-3 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => handleTabChange("daily")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              granularity === "daily"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            日次（30日）
          </button>
          <button
            onClick={() => handleTabChange("monthly")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              granularity === "monthly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            月次（12ヶ月）
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              {error}
            </div>
          )}

          {!loading && !error && data && !hasData && (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              データがありません
            </div>
          )}

          {!loading && !error && data && hasData && (
            <>
              {/* Bar chart */}
              <div className="bg-slate-50 rounded-xl p-4">
                <BarChart data={data} granularity={granularity} />
              </div>

              {/* Summary table */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  期間別サマリー
                </h3>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <SummaryTable data={data} granularity={granularity} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
