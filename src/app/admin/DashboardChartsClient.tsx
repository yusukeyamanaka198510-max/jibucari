"use client";

import { useState } from "react";
import type { MonthlyUserPoint, MonthlyAccessPoint, EduSegment } from "@/lib/adminMockData";
import { UserTrendChart, AccessTrendChart, EducationSegmentChart } from "./DashboardCharts";
import { ChartDetailModal, type ChartType } from "./ChartDetailModal";

interface Props {
  userTrend: MonthlyUserPoint[];
  accessTrend: MonthlyAccessPoint[];
  educationSegments: EduSegment[];
}

export function DashboardChartsClient({ userTrend, accessTrend, educationSegments }: Props) {
  const [selectedChart, setSelectedChart] = useState<ChartType | null>(null);

  const cardBase =
    "bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ユーザー数の推移 */}
        <button
          className={cardBase}
          onClick={() => setSelectedChart("user_trend")}
          aria-label="ユーザー数の推移の詳細を表示"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <h2 className="font-bold text-slate-900 text-sm">ユーザー数の推移</h2>
              <p className="text-xs text-slate-400 mt-0.5">月別新規登録 / 累計ユーザー数</p>
            </div>
            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
              詳細 →
            </span>
          </div>
          <div className="px-2 pt-2 pb-0 h-48">
            <UserTrendChart data={userTrend} />
          </div>
          <div className="px-5 pb-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-indigo-200" />
              <span className="text-xs text-slate-400">新規登録</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded bg-indigo-600" />
              <span className="text-xs text-slate-400">累計</span>
            </div>
          </div>
        </button>

        {/* アクセス数の推移 */}
        <button
          className={cardBase}
          onClick={() => setSelectedChart("access_trend")}
          aria-label="アクセス数の推移の詳細を表示"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <h2 className="font-bold text-slate-900 text-sm">アクセス数の推移</h2>
              <p className="text-xs text-slate-400 mt-0.5">月別アクション数（種別スタック）</p>
            </div>
            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
              詳細 →
            </span>
          </div>
          <div className="px-2 pt-2 pb-0 h-48">
            <AccessTrendChart data={accessTrend} />
          </div>
          <div className="px-5 pb-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
              <span className="text-xs text-slate-400">PDF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              <span className="text-xs text-slate-400">面談</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-xs text-slate-400">履歴書</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
              <span className="text-xs text-slate-400">その他</span>
            </div>
          </div>
        </button>

        {/* 学歴別セグメント */}
        <button
          className={cardBase}
          onClick={() => setSelectedChart("education_trend")}
          aria-label="学歴別セグメントの詳細を表示"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <h2 className="font-bold text-slate-900 text-sm">学歴別セグメント</h2>
              <p className="text-xs text-slate-400 mt-0.5">ユーザーの最終学歴内訳</p>
            </div>
            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
              詳細 →
            </span>
          </div>
          <div className="px-5 py-5">
            <EducationSegmentChart data={educationSegments} />
          </div>
        </button>
      </div>

      {/* モーダル */}
      <ChartDetailModal
        chart={selectedChart}
        onClose={() => setSelectedChart(null)}
      />
    </>
  );
}
