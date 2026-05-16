import Link from "next/link";

/* ─── データ定義 ──────────────────────────────────────────── */
const BENEFITS = [
  { icon: "⚡", text: "AIが志望動機を自動生成" },
  { icon: "📄", text: "JIS準拠PDFをワンクリックDL" },
  { icon: "💾", text: "入力内容を自動保存" },
  { icon: "🔒", text: "登録不要・完全無料" },
];

const DOC_TYPES = [
  {
    href: "/resume/new",
    emoji: "📄",
    label: "履歴書",
    sub: "転職用 / 新卒用 / バイト用 / JIS規格",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    href: "#",
    emoji: "💼",
    label: "職務経歴書",
    sub: "近日公開",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    disabled: true,
  },
  {
    href: "#",
    emoji: "✉️",
    label: "送付状・退職届",
    sub: "近日公開",
    color: "from-sky-500 to-indigo-500",
    bg: "bg-sky-50",
    border: "border-sky-100",
    disabled: true,
  },
  {
    href: "#",
    emoji: "⚡",
    label: "スキルシート",
    sub: "近日公開",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    disabled: true,
  },
];

const STEPS = [
  { n: "01", icon: "🖊️", title: "書類を選ぶ", body: "履歴書・職務経歴書など、作りたい書類をワンタップで選択。" },
  { n: "02", icon: "✍️", title: "フォームに入力", body: "ガイドに沿って入力するだけ。学歴・職歴は自動計算。AIが文章を代わりに書いてくれる。" },
  { n: "03", icon: "📥", title: "PDFでダウンロード", body: "ワンクリックでレイアウト崩れゼロのPDFを即ダウンロード。メール送付も可能。" },
];

const FEATURES = [
  { icon: "🤖", title: "AI志望動機・自己PR自動生成", body: "経歴を入力するだけで、プロ品質の志望動機・自己PRを自動生成。" },
  { icon: "📐", title: "JIS規格準拠PDF", body: "印刷してそのまま使える、レイアウト崩れのない正式書類を出力。" },
  { icon: "💾", title: "リアルタイム自動保存", body: "入力のたびに保存。途中で閉じても、次回から続きを再開できる。" },
  { icon: "📬", title: "メールで直接送付", body: "作成したPDFをそのまま企業・エージェントにメール送付できる。" },
  { icon: "🎓", title: "フォーマット別テンプレート", body: "転職・新卒・アルバイト・写真なしなど、状況に合わせて選べる。" },
  { icon: "🆓", title: "全機能・全テンプレート無料", body: "登録不要・クレカ不要。すべての機能を今すぐ無料で使える。" },
];

/* ─── ページ ──────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ジブキャリ
          </span>
          <Link
            href="/resume/new"
            className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-200"
          >
            無料でつくる →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative pt-14 overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
        {/* 光の装飾 */}
        <div className="pointer-events-none absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[130px] opacity-20" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600 rounded-full blur-[120px] opacity-15" />

        <div className="relative max-w-3xl mx-auto px-5 pt-16 pb-20 text-center">

          {/* バッジ */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            完全無料・登録不要で使えます
          </div>

          {/* ヘッドライン */}
          <h1 className="text-[2rem] sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white mb-6">
            転職・就活の書類を
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              AIで3分で完成。
            </span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-10">
            入力するだけでAIが志望動機を書いてくれる。<br className="hidden sm:block" />
            あとはPDFをダウンロードするだけ。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/resume/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/70 hover:scale-105 transition-all duration-200"
            >
              ✦ 今すぐ無料でつくる
            </Link>
            <a
              href="#how"
              className="w-full sm:w-auto inline-flex items-center justify-center text-slate-300 font-semibold text-base px-8 py-5 rounded-2xl border border-white/15 hover:border-white/30 hover:text-white transition-colors"
            >
              使い方を見る →
            </a>
          </div>

          {/* 3つの特徴バッジ（横並び） */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {[
              { icon: "🤖", text: "AIが志望動機を自動生成" },
              { icon: "📄", text: "JIS準拠PDFを即ダウンロード" },
              { icon: "🆓", text: "登録不要・完全無料" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5 backdrop-blur-sm"
              >
                <span className="text-base">{b.icon}</span>
                <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 下部のウェーブ */}
        <div className="relative">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── 使い方 3ステップ ────────────────────────────── */}
      <section id="how" className="py-12 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-1">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">How it works</p>
            <h2 className="text-2xl font-black">たった3ステップで完成</h2>
            <p className="text-slate-500 text-sm">難しい操作は一切なし。フォームに答えるだけ。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-100">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-10 -right-3 text-slate-300 text-xl z-10">→</div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                    {s.n}
                  </span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <p className="font-bold text-base">{s.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 作れる書類 ──────────────────────────────────── */}
      <section id="docs" className="py-12 px-5 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-1">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Documents</p>
            <h2 className="text-2xl font-black">作れる書類</h2>
            <p className="text-slate-500 text-sm">就活・転職・バイトに必要な書類をすべてカバー。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOC_TYPES.map((d) => {
              const inner = (
                <div className={`group relative overflow-hidden rounded-2xl ${d.bg} border ${d.border} p-4 flex items-center gap-4 transition-all duration-200 ${d.disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:-translate-y-1 cursor-pointer"}`}>
                  <div className={`absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-b ${d.color}`} />
                  <span className="text-3xl">{d.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-slate-900">{d.label}</p>
                    <p className={`text-sm truncate ${d.disabled ? "text-amber-500 font-medium" : "text-slate-500"}`}>{d.sub}</p>
                  </div>
                  {!d.disabled && (
                    <span className="text-slate-300 group-hover:text-indigo-400 transition-colors text-xl flex-shrink-0">→</span>
                  )}
                </div>
              );
              return d.disabled ? (
                <div key={d.label}>{inner}</div>
              ) : (
                <Link key={d.href} href={d.href}>{inner}</Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 機能一覧 ────────────────────────────────────── */}
      <section className="py-12 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-1">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Features</p>
            <h2 className="text-2xl font-black">すべての機能が無料</h2>
            <p className="text-slate-500 text-sm">登録・支払い不要で全機能が使い放題。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:bg-white transition-all duration-200 flex gap-3 items-start"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-bold text-sm">{f.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ボトムCTA ───────────────────────────────────── */}
      <section className="py-12 px-5">
        <div
          className="max-w-3xl mx-auto rounded-3xl text-center text-white p-8 sm:p-12 space-y-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3730a3 0%, #4F46E5 40%, #7C3AED 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.12),transparent)]" />
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-violet-400 rounded-full blur-3xl opacity-20" />
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
            ✦ 無料で履歴書をつくる
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
