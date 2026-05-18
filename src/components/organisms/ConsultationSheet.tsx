"use client";

import { useState } from "react";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const CONSULTATION_TOPICS = [
  { value: "job_hunting",    label: "就職活動の進め方" },
  { value: "resume_review",  label: "履歴書・職務経歴書の添削" },
  { value: "interview_prep", label: "面接対策" },
  { value: "career_change",  label: "転職・キャリアチェンジ" },
  { value: "industry_advice",label: "業界・職種の相談" },
  { value: "other",          label: "その他" },
];

interface ConsultationSheetProps {
  open: boolean;
  onClose: () => void;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * 面談依頼を送るボトムシート。
 * ResumeFormLayout・PdfPreviewModal など各所から共通利用。
 */
export function ConsultationSheet({ open, onClose, name = "", email = "", phone = "" }: ConsultationSheetProps) {
  const { user, openAuthModal } = useAuthStore();
  const [date1, setDate1] = useState({ date: "", hour: "10" });
  const [date2, setDate2] = useState({ date: "", hour: "10" });
  const [date3, setDate3] = useState({ date: "", hour: "10" });
  const [topic, setTopic]             = useState("job_hunting");
  const [isSending, setIsSending]     = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError]     = useState("");

  if (!open) return null;

  const fmtDate = (d: { date: string; hour: string }) =>
    d.date ? `${d.date} ${d.hour}:00` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 未ログインの場合は会員登録モーダルを表示
    if (!user) {
      openAuthModal(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
      return;
    }
    if (!date1.date) { setSendError("第一希望日を入力してください。"); return; }
    setIsSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/email/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone,
          date1: fmtDate(date1),
          date2: fmtDate(date2),
          date3: fmtDate(date3),
          topic,
        }),
      });
      if (res.ok) {
        setSendSuccess(true);
      } else {
        const { error } = await res.json();
        setSendError(error ?? "送信に失敗しました。");
      }
    } catch {
      setSendError("通信エラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* シート本体 */}
      <div className="relative w-full animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-lg bg-white rounded-t-2xl shadow-2xl p-5 max-h-[80vh] overflow-y-auto">
          {/* 閉じるボタン */}
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>

          {!sendSuccess ? (
            <>
              <div className="flex items-start gap-3 mb-5">
                <CalendarDays className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">ダウンロードお疲れさまでした！</p>
                  <p className="text-sm text-indigo-600 mt-0.5">
                    ジブキャリスタッフに無料面談を申し込みませんか？
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 相談内容 */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    相談内容 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    {CONSULTATION_TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-slate-400">希望日時を入力してください（初回面談30〜60分）</p>

                {/* 希望日 */}
                {[
                  { label: "第一希望日", val: date1, set: setDate1, required: true },
                  { label: "第二希望日", val: date2, set: setDate2, required: false },
                  { label: "第三希望日", val: date3, set: setDate3, required: false },
                ].map(({ label, val, set, required }) => (
                  <div key={label} className="space-y-0.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={val.date}
                        onChange={(e) => set((prev) => ({ ...prev, date: e.target.value }))}
                        required={required}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                      <select
                        value={val.hour}
                        onChange={(e) => set((prev) => ({ ...prev, hour: e.target.value }))}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      >
                        {Array.from({ length: 13 }, (_, i) => i + 9).map((h) => (
                          <option key={h} value={String(h)}>{h}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {sendError && <p className="text-xs text-red-500">{sendError}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    今はいい
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isSending ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <><CalendarDays className="h-4 w-4" />面談を申し込む</>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-bold text-slate-800">面談依頼を送信しました！</p>
              <p className="text-sm text-slate-500">担当スタッフより日程のご連絡をいたします。</p>
              <button onClick={onClose} className="mt-2 text-sm text-indigo-600 underline">閉じる</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
