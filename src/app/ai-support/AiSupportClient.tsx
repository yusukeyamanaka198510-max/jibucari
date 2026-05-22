"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Copy, Check, ChevronLeft, ArrowRight,
  Loader2, BookOpen, BriefcaseBusiness, FileText, Save,
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/organisms/AuthModal";

type GenType = "selfPR" | "motivation" | "summary";

const JOB_TYPES = [
  "営業・販売", "事務・アシスタント", "企画・マーケティング",
  "Webエンジニア", "インフラエンジニア", "システムエンジニア",
  "プロジェクトマネージャー", "データアナリスト", "UIデザイナー",
  "Webデザイナー", "グラフィックデザイナー", "コンサルタント",
  "経理・財務", "人事・総務", "研究・開発",
  "医療・福祉・介護", "教育・講師", "接客・サービス",
  "物流・倉庫", "製造・品質管理", "その他",
];

async function callGenerate(type: GenType, fields: {
  company: string; position: string;
  strength: string; experience: string; achievement: string;
}): Promise<string> {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...fields }),
  });
  if (!res.ok) {
    const { error } = await res.json() as { error: string };
    throw new Error(error ?? "生成に失敗しました");
  }
  const { text } = await res.json() as { text: string };
  return text;
}

export function AiSupportClient() {
  const [company,     setCompany]     = useState("");
  const [position,    setPosition]    = useState("");
  const [strength,    setStrength]    = useState("");
  const [experience,  setExperience]  = useState("");
  const [achievement, setAchievement] = useState("");

  const [generated,    setGenerated]    = useState("");
  const [loading,      setLoading]      = useState<GenType | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [reflected,    setReflected]    = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [savedId,      setSavedId]      = useState<string | null>(null);
  const [currentGenType, setCurrentGenType] = useState<GenType | null>(null);

  // Zustand store への反映
  const setMotivation = useResumeStore((s) => s.setMotivation);
  const setSelfPR     = useResumeStore((s) => s.setSelfPR);
  const { user, openAuthModal } = useAuthStore();

  const handleGenerate = async (type: GenType) => {
    setLoading(type);
    setError(null);
    setGenerated("");
    setReflected(null);
    setCurrentGenType(type);
    setSavedId(null);
    try {
      const text = await callGenerate(type, { company, position, strength, experience, achievement });
      setGenerated(text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleSave = async () => {
    if (!user) { openAuthModal(window.location.pathname); return; }
    if (!generated || !currentGenType) return;
    setSaving(true);
    try {
      await fetch("/api/ai/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genType: currentGenType, text: generated, company, position }),
      });
      setSavedId("done");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleReflect = (target: "resume-selfPR" | "resume-motivation") => {
    if (!generated) return;
    if (target === "resume-selfPR")     setSelfPR(generated);
    if (target === "resume-motivation") setMotivation(generated);
    setReflected(target);
    setTimeout(() => setReflected(null), 3000);
  };

  const BUTTONS: { type: GenType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: "selfPR",     label: "自己PRを作る",    icon: <BookOpen className="h-4 w-4" />,         color: "from-violet-500 to-purple-600" },
    { type: "motivation", label: "志望動機を作る",  icon: <BriefcaseBusiness className="h-4 w-4" />, color: "from-indigo-500 to-blue-600"   },
    { type: "summary",    label: "職務要約を作る",  icon: <FileText className="h-4 w-4" />,          color: "from-sky-500 to-cyan-600"       },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />トップ
            </Link>
            <span className="text-slate-200">|</span>
            <Link href="/resume/new" className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
              履歴書作成
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              AIサポート
            </span>
          </div>
          <Link
            href="/resume/new"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
          >
            履歴書作成に戻る <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* ページタイトル */}
        <div className="mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-0.5">AI SUPPORT</p>
            <h1 className="text-2xl font-black text-slate-900">AIサポート</h1>
            <p className="text-sm text-slate-500 mt-1">
              入力内容から<strong className="text-indigo-600">自己PR・志望動機・職務要約</strong>のたたき台をAIが作成します。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── 左：入力フォーム ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center">1</span>
              文章の材料を入力
            </h2>

            <div className="space-y-4">
              {/* 応募先・会社名 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  応募先・会社名
                </label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="例：株式会社ジブキャリ"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                />
              </div>

              {/* 応募職種 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  応募職種
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700"
                >
                  <option value="">応募職種を選択</option>
                  {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {/* 強み */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  強み <span className="text-slate-400 font-normal">（自分の得意なこと）</span>
                </label>
                <input
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="例：正確に作業を進める力、コミュニケーション力"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                />
              </div>

              {/* 経験 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  経験 <span className="text-slate-400 font-normal">（職歴・学業・バイトなど）</span>
                </label>
                <input
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="例：顧客対応と資料作成を3年担当"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                />
              </div>

              {/* 成果・工夫 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  成果・工夫 <span className="text-slate-400 font-normal">（具体的なエピソード）</span>
                </label>
                <input
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="例：確認手順を整えてミスを月10件→2件に削減"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* 生成ボタン群 */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-slate-500 mb-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-black inline-flex items-center justify-center mr-1.5">2</span>
                作りたい文章を選ぶ
              </p>
              {BUTTONS.map(({ type, label, icon, color }) => (
                <button
                  key={type}
                  onClick={() => handleGenerate(type)}
                  disabled={!!loading}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${color} text-white font-bold py-3 rounded-xl shadow-sm hover:opacity-90 hover:shadow-md transition-all disabled:opacity-50 text-sm`}
                >
                  {loading === type
                    ? <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
                    : <>{icon}{label}</>
                  }
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3">
                {error}
              </div>
            )}
          </div>

          {/* ── 右：生成結果 ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-xs font-black flex items-center justify-center">3</span>
                  生成結果
                </h2>
                {generated && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {copiedResult
                      ? <><Check className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-500">コピー済み</span></>
                      : <><Copy className="h-3.5 w-3.5" />コピー</>
                    }
                  </button>
                )}
              </div>

              {/* 結果表示エリア */}
              <div className={`min-h-[200px] rounded-xl border p-4 text-sm transition-all ${
                generated
                  ? "border-indigo-200 bg-indigo-50/30 text-slate-800"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}>
                {loading
                  ? (
                    <div className="flex flex-col items-center justify-center h-[200px] gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-100" />
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin absolute inset-0" />
                      </div>
                      <p className="text-indigo-500 font-semibold text-sm">AIが文章を生成中...</p>
                    </div>
                  )
                  : generated
                    ? <p className="whitespace-pre-wrap leading-relaxed">{generated}</p>
                    : (
                      <div className="flex flex-col items-center justify-center h-[200px] gap-2 text-center">
                        <Sparkles className="h-8 w-8 text-slate-300" />
                        <p>左の材料を入力してボタンを押すと<br />ここに文章が表示されます</p>
                      </div>
                    )
                }
              </div>

              {/* 保存ボタン */}
              {generated && (
                <button
                  onClick={handleSave}
                  disabled={saving || !!savedId}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    savedId
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  } disabled:opacity-50`}
                >
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin" />保存中...</>
                    : savedId
                      ? <><Check className="h-4 w-4 text-emerald-500" />作成履歴に保存しました</>
                      : <><Save className="h-4 w-4" />この文章を作成履歴に保存する</>
                  }
                </button>
              )}

              {/* 反映ボタン */}
              {generated && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-black flex items-center justify-center">4</span>
                    履歴書・職務経歴書に反映する
                  </p>
                  {[
                    { target: "resume-selfPR"     as const, label: "履歴書の自己PRへ反映",    href: "/resume/new?format=jis&step=5"             },
                    { target: "resume-motivation" as const, label: "履歴書の志望動機へ反映",  href: "/resume/new?format=career_change&step=5"   },
                  ].map(({ target, label, href }) => (
                    <button
                      key={target}
                      onClick={() => handleReflect(target)}
                      className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        reflected === target
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {reflected === target
                          ? <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          : <ArrowRight className="h-4 w-4 flex-shrink-0" />
                        }
                        {reflected === target ? "反映しました！" : label}
                      </span>
                      {reflected === target && (
                        <Link
                          href={href}
                          className="text-xs text-indigo-600 underline hover:text-indigo-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          確認する →
                        </Link>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 注意書き */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3">
              <span className="text-amber-400 text-xl flex-shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                生成文はそのまま提出せず、<strong>あなた自身の言葉に調整</strong>して使ってください。
                AIは参考文を作るためのものです。
              </p>
            </div>

            {/* 履歴書作成へのCTA */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-bold text-slate-700">文章ができたら履歴書に入力しよう</p>
              <p className="text-xs text-slate-500">生成した文章を「反映」ボタンで貼り付けるか、コピーして直接入力できます。</p>
              <Link
                href="/resume/new"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm hover:opacity-90 transition-opacity"
              >
                <FileText className="h-4 w-4" />
                履歴書を作成する
              </Link>
            </div>
          </div>
        </div>
      </main>
      <AuthModal />
    </div>
  );
}
