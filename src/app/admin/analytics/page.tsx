import type { Metadata } from "next";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata: Metadata = { title: "アクセス分析 | ジブキャリ管理" };

export default function AnalyticsPage() {
  return (
    <div className="flex-1 p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">アクセス分析</h1>
        <p className="text-sm text-slate-500 mt-1">ユーザー行動・ファネル・CTAのリアルタイム集計</p>
      </div>
      <AnalyticsClient />
    </div>
  );
}
