import Link from "next/link";

/* ─── データ定義 ──────────────────────────────────────────── */
const DOC_TYPES = [
  {
    href: "/resume/new",
    emoji: "📄",
    label: "履歴書",
    sub: "JIS規格 / 転職用 / 新卒用 / バイト用",
    accent: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
  },
  {
    href: "/cv/new",
    emoji: "💼",
    label: "職務経歴書",
    sub: "編年体・キャリア式テンプレート",
    accent: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
  {
    href: "/cover-letter/new",
    emoji: "✉️",
    label: "送付状・退職届",
    sub: "定型フォームで3分完成",
    accent: "from-sky-500 to-indigo-500",
    bg: "bg-sky-50",
  },
  {
    href: "/skill-sheet/new",
    emoji: "⚡",
    label: "スキルシート",
    sub: "エンジニア向け技術スタック管理",
    accent: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
];

const STEPS = [
  { n: "01", title: "書類を選ぶ", body: "履歴書・職務経歴書・スキルシートなど作りたい書類を選択。" },
  { n: "02", title: "入力する", body: "ガイドに沿って入力するだけ。学歴・職歴は自動で計算してくれる。" },
  { n: "03", title: "PDFで受け取る", body: "ワンクリックでレイアウト崩れのないPDFをダウンロード。" },
];

const FEATURES = [
  { icon: "🤖", title: "AI自動作成", body: "経歴を入力すると志望動機・自己PRを自動生成。" },
  { icon: "💾", title: "自動保存", body: "入力のたびにリアルタイムで保存。途中で閉じても安心。" },
  { icon: "🔍", title: "書類読み取り", body: "PDFや写真から情報を読み取り自動入力（OCR）。" },
  { icon: "📬", title: "メール送信", body: "作成した書類をアプリから直接企業にメール送付。" },
  { icon: "🧠", title: "AI面接練習", body: "チャットUIで模擬面接。想定質問に答えて対策できる。" },
  { icon: "✨", title: "自己分析診断", body: "20問の診断で強みを発見。自己PRに自動反映。" },
];

/* ─── ページ ──────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ジブキャリ
          </span>
          <Link
            href="/resume/new"
            className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            無料でつくる
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-10 px-5 text-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      >
        {/* 背景の装飾円 */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20" />
        <div className="pointer-events-none absolute -top-16 -right-24 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            完全無料・登録不要で使えます
          </div>

          {/* ヘッドライン */}
          <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
            自分のキャリアを、
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              自分の言葉で。
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            履歴書・職務経歴書・スキルシートをブラウザだけで完結。
            <br className="hidden sm:block" />
            入力してダウンロード、それだけでいい。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/resume/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-200"
            >
              <span>✦</span> 履歴書を無料でつくる
            </Link>
            <a
              href="#docs"
              className="w-full sm:w-auto inline-flex items-center justify-center text-slate-600 font-semibold text-sm px-6 py-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              作れる書類を見る →
            </a>
          </div>

          {/* ソーシャルプルーフ */}
          <p className="text-xs text-slate-400 pt-2">
            クレジットカード不要 ・ アカウント登録不要 ・ 広告なし
          </p>
        </div>
      </section>

      {/* ── 書類タイプ ──────────────────────────────────── */}
      <section id="docs" className="py-20 px-5 bg-slate-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Documents</p>
            <h2 className="text-3xl font-black">作れる書類</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOC_TYPES.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className={`group relative overflow-hidden rounded-2xl ${d.bg} border border-white p-6 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
              >
                {/* グラデーション装飾 */}
                <div
                  className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b ${d.accent}`}
                />
                <span className="text-4xl">{d.emoji}</span>
                <div className="min-w-0">
                  <p className="font-bold text-lg text-slate-900">{d.label}</p>
                  <p className="text-sm text-slate-500 truncate">{d.sub}</p>
                </div>
                <span className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors text-xl">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 使い方 3ステップ ────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">How it works</p>
            <h2 className="text-3xl font-black">たった3ステップ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-100 rounded-3xl overflow-hidden">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white p-8 space-y-3">
                <span className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                  {s.n}
                </span>
                <p className="font-bold text-lg">{s.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 機能一覧 ────────────────────────────────────── */}
      <section className="py-20 px-5 bg-slate-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Features</p>
            <h2 className="text-3xl font-black">すべての機能が無料</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 space-y-2"
              >
                <span className="text-2xl">{f.icon}</span>
                <p className="font-bold text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ボトムCTA ───────────────────────────────────── */}
      <section className="py-24 px-5">
        <div
          className="max-w-3xl mx-auto rounded-3xl text-center text-white p-12 sm:p-16 space-y-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15),transparent)]" />
          <h2 className="relative text-3xl sm:text-4xl font-black leading-tight">
            まず、一枚つくってみよう。
          </h2>
          <p className="relative text-indigo-200 text-sm">
            登録不要。クレカ不要。今すぐ始められる。
          </p>
          <Link
            href="/resume/new"
            className="relative inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-200"
          >
            <span>✦</span> 無料で履歴書をつくる
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 px-5 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-700 mb-1">ジブキャリ</p>
        <p>© 2025 ジブキャリ. All rights reserved.</p>
      </footer>
    </div>
  );
}
