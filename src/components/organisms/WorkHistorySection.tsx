"use client";

import { useState } from "react";
import { Trash2, PlusCircle, BriefcaseBusiness, X } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { FormField } from "@/components/molecules/FormField";
import { YearMonthSelector } from "@/components/molecules/YearMonthSelector";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { cn } from "@/lib/utils";

const POSITION_CANDIDATES = [
  "営業", "内勤営業", "法人営業", "個人営業", "販売・接客", "店長",
  "事務", "総務", "人事", "経理", "財務", "購買・調達",
  "マーケティング", "広報・PR", "企画", "商品企画",
  "Webエンジニア", "システムエンジニア", "プログラマー", "インフラエンジニア",
  "プロジェクトマネージャー", "スクラムマスター", "データアナリスト",
  "UIデザイナー", "グラフィックデザイナー", "Webデザイナー",
  "コンサルタント", "ITコンサルタント",
  "研究開発", "品質管理・QC", "製造・生産管理", "物流・倉庫管理", "ドライバー",
  "医師", "看護師", "薬剤師", "介護士", "保育士", "教師・講師",
  "料理人・シェフ", "美容師", "理容師",
  "主任", "係長", "課長", "部長", "マネージャー", "チームリーダー", "役員",
];

export function WorkHistorySection({ className }: { className?: string }) {
  const workHistory = useResumeStore((s) => s.current?.workHistory ?? []);
  const addWork = useResumeStore((s) => s.addWork);
  const updateWork = useResumeStore((s) => s.updateWork);
  const removeWork = useResumeStore((s) => s.removeWork);

  const [noWork, setNoWork] = useState(false);

  return (
    <section className={cn("space-y-4", className)} aria-labelledby="work-history-heading">
      <h2 id="work-history-heading" className="text-lg font-semibold border-b pb-2">職歴</h2>

      {/* 職歴あり / なし 切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setNoWork(false)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
            !noWork
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          )}
        >
          <BriefcaseBusiness className="h-4 w-4 inline mr-1.5" />
          職歴あり
        </button>
        <button
          onClick={() => setNoWork(true)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
            noWork
              ? "border-slate-500 bg-slate-50 text-slate-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          )}
        >
          <X className="h-4 w-4 inline mr-1.5" />
          職歴なし（新卒など）
        </button>
      </div>

      {noWork ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-slate-400 text-sm">
          職歴なしとして記載されます
        </div>
      ) : (
        <>
          <ol className="space-y-4">
            {workHistory.map((entry, index) => (
              <li key={entry.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    職歴 {index + 1}
                  </span>
                  <button
                    onClick={() => removeWork(entry.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={`職歴 ${index + 1} を削除`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* 会社名・役職・部署 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField id={`work-company-${entry.id}`} label="会社名" required>
                    <Input
                      id={`work-company-${entry.id}`}
                      value={entry.company}
                      onChange={(e) => updateWork(entry.id, { company: e.target.value })}
                      placeholder="株式会社〇〇"
                    />
                  </FormField>
                  <FormField id={`work-position-${entry.id}`} label="役職・職種">
                    <Input
                      id={`work-position-${entry.id}`}
                      list={`work-position-list-${entry.id}`}
                      value={entry.position ?? ""}
                      onChange={(e) => updateWork(entry.id, { position: e.target.value })}
                      placeholder="Webエンジニア"
                    />
                    <datalist id={`work-position-list-${entry.id}`}>
                      {POSITION_CANDIDATES.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </FormField>
                  <FormField id={`work-dept-${entry.id}`} label="部署">
                    <Input
                      id={`work-dept-${entry.id}`}
                      value={entry.department ?? ""}
                      onChange={(e) => updateWork(entry.id, { department: e.target.value })}
                      placeholder="開発部"
                    />
                  </FormField>
                </div>

                {/* 入社 */}
                <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">入社</p>
                  <YearMonthSelector
                    year={entry.entryYear}
                    month={entry.entryMonth}
                    onYearChange={(y) => updateWork(entry.id, { entryYear: y })}
                    onMonthChange={(m) => updateWork(entry.id, { entryMonth: m })}
                  />
                </div>

                {/* 退社 */}
                <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">退社</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {!entry.isCurrent && (
                      <YearMonthSelector
                        year={entry.exitYear ?? entry.entryYear}
                        month={entry.exitMonth ?? entry.entryMonth}
                        onYearChange={(y) => updateWork(entry.id, { exitYear: y, isCurrent: false })}
                        onMonthChange={(m) => updateWork(entry.id, { exitMonth: m, isCurrent: false })}
                      />
                    )}
                    <button
                      onClick={() => updateWork(entry.id, {
                        isCurrent: !entry.isCurrent,
                        exitYear: undefined,
                        exitMonth: undefined,
                      })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all",
                        entry.isCurrent
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      在職中（現在に至る）
                    </button>
                  </div>
                </div>

                {/* 業務内容 */}
                <FormField id={`work-desc-${entry.id}`} label="業務内容">
                  <Textarea
                    id={`work-desc-${entry.id}`}
                    value={entry.description ?? ""}
                    onChange={(e) => updateWork(entry.id, { description: e.target.value })}
                    placeholder="担当業務・実績を記載してください"
                    rows={3}
                  />
                </FormField>
              </li>
            ))}
          </ol>

          <button
            onClick={addWork}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            職歴を追加
          </button>
        </>
      )}
    </section>
  );
}
