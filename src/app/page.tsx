import Link from "next/link";
import Image from "next/image";

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
      <section className="relative pt-14 overflow-hidden min-h-[90vh] flex items-center">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
        {/* 光の装飾 */}
        <div className="pointer-events-none absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[140px] opacity-20" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600 rounded-full blur-[120px] opacity-15" />

        <div className="relative max-w-6xl mx-auto px-5 py-16 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

            {/* ── 左: テキスト ── */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              {/* バッジ */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                完全無料・登録不要で使えます
              </div>

              {/* ヘッドライン */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white">
                  転職・就活の
                  <br />書類を
                  <br />
                  <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                    AIで3分で完成。
                  </span>
                </h1>
                <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0">
                  入力するだけでAIが志望動機を書いてくれる。<br />
                  あとはPDFをダウンロードするだけ。
                </p>
              </div>

              {/* チェックリスト（シンプルに） */}
              <ul className="space-y-3 max-w-sm mx-auto lg:mx-0">
                {[
                  "🤖　AIが志望動機・自己PRを自動生成",
                  "📄　JIS準拠PDFをワンクリックでDL",
                  "🆓　登録不要・クレカ不要・完全無料",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-200 text-base font-medium">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/resume/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/70 hover:scale-105 transition-all duration-200"
                >
                  ✦ 今すぐ無料でつくる
                </Link>
              </div>

              <p className="text-sm text-slate-500">
                クレジットカード不要 ・ アカウント登録不要 ・ 広告なし
              </p>
            </div>

            {/* ── 右: フクロウキャラクター ── */}
            <div className="relative flex-shrink-0 flex items-center justify-center lg:ml-8">
              {/* グロー（背景光） */}
              <div className="absolute w-80 h-80 bg-indigo-500 rounded-full blur-[80px] opacity-25" />

              {/* フキダシ（左上） */}
              <div className="absolute -top-6 -left-8 z-20 hidden sm:block">
                <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3 shadow-2xl border border-indigo-100">
                  <p className="text-sm font-bold text-indigo-700 whitespace-nowrap">🤖 志望動機、AIに任せよう！</p>
                </div>
                {/* 吹き出し三角 */}
                <div className="absolute bottom-0 left-6 w-3 h-3 bg-white rotate-45 translate-y-1.5 border-r border-b border-indigo-100" />
              </div>

              {/* フキダシ（右下） */}
              <div className="absolute -bottom-6 -right-8 z-20 hidden sm:block">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl rounded-br-md px-5 py-3 shadow-2xl">
                  <p className="text-sm font-bold text-white whitespace-nowrap">📄 PDF即ダウンロード！</p>
                </div>
                <div className="absolute top-0 right-6 w-3 h-3 bg-violet-600 rotate-45 -translate-y-1.5" />
              </div>

              {/* フクロウ画像 */}
              <div className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px]">
                <Image
                  src="/images/owl-hero.png"
                  alt="ジブキャリ キャラクター"
                  fill
                  className="object-contain"
                  style={{ mixBlendMode: "lighten" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* 下部のウェーブ */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── 使い方 3ステップ ────────────────────────────── */}
      <section id="how" className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">How it works</p>
            <h2 className="text-3xl font-black">たった3ステップで完成</h2>
            <p className="text-slate-500 text-sm">難しい操作は一切なし。フォームに答えるだけ。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative bg-slate-50 rounded-2xl p-7 space-y-3 border border-slate-100">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-10 -right-3 text-slate-300 text-xl z-10">→</div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                    {s.n}
                  </span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <p className="font-bold text-lg">{s.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 作れる書類 ──────────────────────────────────── */}
      <section id="docs" className="py-20 px-5 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Documents</p>
            <h2 className="text-3xl font-black">作れる書類</h2>
            <p className="text-slate-500 text-sm">就活・転職・バイトに必要な書類をすべてカバー。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOC_TYPES.map((d) => {
              const inner = (
                <div className={`group relative overflow-hidden rounded-2xl ${d.bg} border ${d.border} p-6 flex items-center gap-5 transition-all duration-200 ${d.disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:-translate-y-1 cursor-pointer"}`}>
                  <div className={`absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-b ${d.color}`} />
                  <span className="text-4xl">{d.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg text-slate-900">{d.label}</p>
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
      <section className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">Features</p>
            <h2 className="text-3xl font-black">すべての機能が無料</h2>
            <p className="text-slate-500 text-sm">登録・支払い不要で全機能が使い放題。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:bg-white transition-all duration-200 space-y-2"
              >
                <span className="text-3xl">{f.icon}</span>
                <p className="font-bold text-base">{f.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ボトムCTA ───────────────────────────────────── */}
      <section className="py-24 px-5">
        <div
          className="max-w-3xl mx-auto rounded-3xl text-center text-white p-12 sm:p-16 space-y-6 relative overflow-hidden"
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
