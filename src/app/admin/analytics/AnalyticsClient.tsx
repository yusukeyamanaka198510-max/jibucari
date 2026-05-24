"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  UserCheck,
  MessageSquare,
  RefreshCw,
  Calendar,
  ChevronRight,
  Download,
  Mail,
  FileText,
  Pencil,
  UserPlus,
  LogIn,
  CalendarRange,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageView { page: string; count: number }
interface CtaClick { action: string; label: string; count: number }
interface FunnelStep { step: number; label: string; count: number }
interface RecentInterview {
  id: string; userId: string; targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string; hasDatetime: boolean;
}

interface AnalyticsData {
  fromDate: string | null;
  toDate: string | null;
  totalPageViews: number;
  topPageViews: PageView[];
  ctaClicks: CtaClick[];
  actionBreakdown: Record<string, number>;
  resumeFunnel: FunnelStep[];
  totalUsers: number;
  registerWithResumeCount: number;
  interviewTotal: number;
  interviewWithDatetimeCount: number;
  recentInterviews: RecentInterview[];
}

// ── Date range presets ────────────────────────────────────────────────────────

type Preset = "7d" | "30d" | "90d" | "all" | "custom";

interface DateRange {
  preset: Preset;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function presetRange(preset: Exclude<Preset, "custom">): { from: string; to: string } {
  const today = new Date();
  const to = toYMD(today);
  if (preset === "all") return { from: "2020-01-01", to };
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const from = new Date(today);
  from.setDate(from.getDate() - days + 1);
  return { from: toYMD(from), to };
}

function defaultRange(): DateRange {
  return { preset: "7d", ...presetRange("7d") };
}

// ── CTA icon/color map ────────────────────────────────────────────────────────

const CTA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf_download:      Download,
  pdf_email:         Mail,
  interview_request: MessageSquare,
  resume_created:    FileText,
  resume_updated:    Pencil,
  profile_updated:   UserCheck,
  register:          UserPlus,
  login:             LogIn,
};

const CTA_COLORS: Record<string, { icon: string; bg: string; bar: string }> = {
  pdf_download:      { icon: "text-indigo-600", bg: "bg-indigo-50",  bar: "bg-indigo-500" },
  pdf_email:         { icon: "text-violet-600", bg: "bg-violet-50",  bar: "bg-violet-500" },
  interview_request: { icon: "text-amber-600",  bg: "bg-amber-50",   bar: "bg-amber-500"  },
  resume_created:    { icon: "text-emerald-600",bg: "bg-emerald-50", bar: "bg-emerald-500"},
  resume_updated:    { icon: "text-blue-600",   bg: "bg-blue-50",    bar: "bg-blue-500"   },
  profile_updated:   { icon: "text-cyan-600",   bg: "bg-cyan-50",    bar: "bg-cyan-500"   },
  register:          { icon: "text-green-600",  bg: "bg-green-50",   bar: "bg-green-500"  },
  login:             { icon: "text-slate-600",  bg: "bg-slate-50",   bar: "bg-slate-400"  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(ymd: string) {
  const [y, m, d] = ymd.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function pct(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({
  icon: Icon, title, subtitle,
}: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Skeleton({ h = "h-40" }: { h?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-100 ${h} animate-pulse`} />;
}

// ── Date Range Picker ─────────────────────────────────────────────────────────

const PRESET_LABELS: Record<Preset, string> = {
  "7d":    "直近7日",
  "30d":   "直近30日",
  "90d":   "直近90日",
  "all":   "全期間",
  "custom":"期間指定",
};

function DateRangePicker({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [showCustom, setShowCustom] = useState(range.preset === "custom");
  const [tempFrom, setTempFrom] = useState(range.from);
  const [tempTo, setTempTo]   = useState(range.to);

  const handlePreset = (preset: Preset) => {
    if (preset === "custom") {
      setShowCustom(true);
      onChange({ preset: "custom", from: tempFrom, to: tempTo });
    } else {
      setShowCustom(false);
      const r = presetRange(preset as Exclude<Preset, "custom">);
      setTempFrom(r.from);
      setTempTo(r.to);
      onChange({ preset, ...r });
    }
  };

  const handleApply = () => {
    if (tempFrom && tempTo && tempFrom <= tempTo) {
      onChange({ preset: "custom", from: tempFrom, to: tempTo });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
      {/* Preset buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarRange className="w-4 h-4 text-slate-400 shrink-0" />
        {(["7d", "30d", "90d", "all", "custom"] as Preset[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              range.preset === p
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}

        {/* Active period display */}
        <span className="ml-auto text-xs text-slate-400 shrink-0">
          {range.preset === "all"
            ? "全期間"
            : `${fmtDate(range.from)} 〜 ${fmtDate(range.to)}`}
        </span>
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 shrink-0">開始日</label>
            <input
              type="date"
              value={tempFrom}
              max={tempTo}
              onChange={(e) => setTempFrom(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <span className="text-slate-300">〜</span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 shrink-0">終了日</label>
            <input
              type="date"
              value={tempTo}
              min={tempFrom}
              max={toYMD(new Date())}
              onChange={(e) => setTempTo(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={!tempFrom || !tempTo || tempFrom > tempTo}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
          >
            適用
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsClient() {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    setUnavailable(false);
    try {
      const params = new URLSearchParams();
      if (r.preset === "all") {
        params.set("range", "all");
      } else {
        params.set("from", r.from);
        params.set("to",   r.to);
      }
      const res = await fetch(`/api/admin/analytics?${params.toString()}`, { cache: "no-store" });
      if (res.status === 503) { setUnavailable(true); return; }
      if (!res.ok) { setError(`エラー: ${res.status}`); return; }
      const json = (await res.json()) as { data: AnalyticsData };
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回 & range 変化時に取得
  useEffect(() => { void fetchData(range); }, [fetchData, range]);

  const handleRangeChange = (r: DateRange) => {
    setRange(r);
  };

  // ── Error / Unavailable states ────────────────────────────────────────────

  if (unavailable) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
        Supabase未接続のため表示できません
      </div>
    );
  }

  const maxCtaCount  = Math.max(...(data?.ctaClicks.map((c) => c.count) ?? [1]), 1);
  const funnelMax    = Math.max(...(data?.resumeFunnel.map((s) => s.count) ?? [1]), 1);

  return (
    <div className="space-y-6">
      {/* ── 期間選択 ── */}
      <DateRangePicker range={range} onChange={handleRangeChange} />

      {/* ── 更新ボタン ── */}
      <div className="flex items-center justify-between">
        {/* 選択中の期間ラベル */}
        <p className="text-sm text-slate-500">
          表示期間：
          <span className="font-bold text-slate-700">
            {range.preset === "all"
              ? "全期間"
              : `${fmtDate(range.from)} 〜 ${fmtDate(range.to)}`}
          </span>
        </p>
        <button
          onClick={() => { void fetchData(range); }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          更新
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} h="h-28" />)}
          </div>
          <Skeleton h="h-64" />
          <Skeleton h="h-56" />
          <Skeleton h="h-48" />
        </div>
      ) : data ? (
        <>
          {/* ── サマリーカード ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "総ページ表示数",       value: data.totalPageViews,             icon: Eye,           color: "text-indigo-600", bg: "bg-indigo-50"  },
              { label: "面談リクエスト",        value: data.interviewTotal,             icon: MessageSquare, color: "text-amber-600",  bg: "bg-amber-50"   },
              { label: "希望日時あり面談",      value: data.interviewWithDatetimeCount, icon: Calendar,      color: "text-emerald-600",bg: "bg-emerald-50" },
              { label: "履歴書作成→登録完了", value: data.registerWithResumeCount,   icon: UserCheck,     color: "text-violet-600", bg: "bg-violet-50"  },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── CTAボタン押下数 ── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <SectionTitle
              icon={MousePointerClick}
              title="CTAボタン押下数"
              subtitle="各機能ボタンが押された合計回数"
            />
            <div className="space-y-3">
              {[...data.ctaClicks]
                .sort((a, b) => b.count - a.count)
                .map((cta) => {
                  const colors = CTA_COLORS[cta.action] ?? { icon: "text-slate-600", bg: "bg-slate-50", bar: "bg-slate-400" };
                  const Icon   = CTA_ICONS[cta.action] ?? MousePointerClick;
                  const barPct = pct(cta.count, maxCtaCount);
                  return (
                    <div key={cta.action} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-700">{cta.label}</span>
                          <span className="text-sm font-black text-slate-900 ml-3 shrink-0">{cta.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`${colors.bar} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ── 履歴書作成ファネル ── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <SectionTitle
              icon={TrendingUp}
              title="履歴書作成ファネル"
              subtitle="期間内に各ステップを行ったユニークユーザー数"
            />
            <div className="space-y-3">
              {data.resumeFunnel.map((step, idx) => {
                const barPct   = pct(step.count, funnelMax);
                const convRate = idx === 0 ? null : pct(step.count, data.resumeFunnel[idx - 1]?.count ?? funnelMax);
                const COLORS   = ["bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"];
                const barColor = COLORS[idx] ?? "bg-slate-400";
                return (
                  <div key={step.step} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-slate-500">{step.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                          {convRate !== null && (
                            <span className="text-xs text-slate-400">
                              <ChevronRight className="w-3 h-3 inline" />
                              前ステップ比 <span className="font-bold text-slate-600">{convRate}%</span>
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black text-slate-900 ml-3 shrink-0">{step.count.toLocaleString()} 人</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <p className="text-sm text-indigo-700">
                <span className="font-black">{data.registerWithResumeCount.toLocaleString()} 名</span>
                {" "}が期間内に履歴書作成 + 会員登録の両方を達成
                （累計ユーザーの <span className="font-bold">{pct(data.registerWithResumeCount, data.totalUsers)}%</span>）
              </p>
            </div>
          </div>

          {/* ── ページ別表示数 ── */}
          {data.totalPageViews > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <SectionTitle
                icon={Eye}
                title="ページ別表示数"
                subtitle="page_view アクションが記録されたページ（上位20件）"
              />
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-50">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ページ</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">表示数</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">割合</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.topPageViews.map(({ page, count }) => (
                      <tr key={page} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-sm text-slate-700 font-mono">{page}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-900">{count.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-500">{pct(count, data.totalPageViews)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ページ表示数が0の場合 ── */}
          {data.totalPageViews === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
              <SectionTitle icon={Eye} title="ページ別表示数" />
              <p className="text-sm text-slate-400 text-center py-6">
                この期間にページ閲覧ログがありません
              </p>
            </div>
          )}

          {/* ── 面談リクエスト一覧 ── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle
                icon={MessageSquare}
                title="面談リクエスト"
                subtitle={`総数 ${data.interviewTotal} 件 / うち希望日時あり ${data.interviewWithDatetimeCount} 件`}
              />
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 font-medium">日時送信率</p>
                <p className="text-2xl font-black text-amber-600">
                  {data.interviewTotal > 0 ? pct(data.interviewWithDatetimeCount, data.interviewTotal) : 0}%
                </p>
              </div>
            </div>

            {data.recentInterviews.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">この期間に面談リクエストがありません</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-50">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">日時</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ユーザーID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">希望日時</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">備考</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recentInterviews.map((req) => {
                      const preferredDate =
                        req.metadata?.["preferred_date"] ?? req.metadata?.["preferredDate"] ??
                        req.metadata?.["date"] ?? req.metadata?.["datetime"] ??
                        req.metadata?.["preferred_datetime"] ?? req.metadata?.["scheduledAt"];
                      const note =
                        req.metadata?.["note"] ?? req.metadata?.["message"] ?? req.metadata?.["comment"];
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDateTime(req.createdAt)}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono truncate max-w-[8rem]">{req.userId}</td>
                          <td className="px-4 py-3">
                            {req.hasDatetime ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Calendar className="w-3 h-3" />
                                {String(preferredDate)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">未入力</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[12rem] truncate">
                            {note ? String(note) : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
