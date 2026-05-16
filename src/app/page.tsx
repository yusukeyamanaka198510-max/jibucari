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
    sub: "転職・新卒・バイト・JIS規格の5テンプレートから選択",
    badge: "最もよく使われる",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badgeColor: "bg-indigo-600",
  },
  {
    href: "/cv/new",
    emoji: "💼",
    label: "職務経歴書",
    sub: "経歴・スキルを詳しくまとめてPDFに出力",
    badge: "転職活動に必須",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badgeColor: "bg-violet-600",
  },
  {
    href: "/cover-letter/new",
    emoji: "✉️",
    label: "送付状・退職届",
    sub: "応募書類の送付状と退職届をかんたん作成",
    badge: "",
    color: "from-sky-500 to-indigo-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badgeColor: "bg-sky-600",
  },
  {
    href: "/skill-sheet/new",
    emoji: "⚡",
    label: "スキルシート",
    sub: "技術スキル・プロジェクト経歴を表形式で整理",
    badge: "ITエンジニア向け",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeColor: "bg-emerald-600",
  },
];

const STEPS = [
  {
    n: "01", icon: "📋",
    title: "書類の種類を選ぶ",
    body: "履歴書・職務経歴書・スキルシートなど必要な書類をタップするだけ。転職・新卒・バイト用テンプレートも揃っています。",
    hint: "5種類のフォーマットから選択",
  },
  {
    n: "02", icon: "✏️",
    title: "フォームに答える",
    body: "名前・住所・経歴を入力するだけ。AIが志望動機・自己PRを自動生成。学歴・職歴の計算も不要です。",
    hint: "AIが文章を自動生成",
  },
  {
    n: "03", icon: "📥",
    title: "PDFをダウンロード",
    body: "ボタン1つでA4対応のPDFが即完成。レイアウト崩れゼロ。そのままメールで企業に送付することも可能です。",
    hint: "印刷してそのまま提出OK",
  },
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
        <div className="pointer-events-none absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[140px] opacity-20" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[130px] opacity-20" />

        <div className="relative max-w-6xl mx-auto px-5 pt-10 pb-0">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

            {/* ── 左: テキストブロック ── */}
            <div className="flex-1 text-center lg:text-left lg:pr-8 pb-10 lg:pb-20">
              {/* バッジ */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm mb-7">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                完全無料・登録不要で使えます
              </div>

              {/* ヘッドライン */}
              <h1 className="text-[2rem] sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight text-white mb-5">
                転職・就活の書類を
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                  AIで3分で完成。
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                入力するだけでAIが志望動機を書いてくれる。<br className="hidden sm:block" />
                あとはPDFをダウンロードするだけ。
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-7">
                <Link
                  href="/resume/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-lg px-9 py-4 rounded-2xl shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/70 hover:scale-105 transition-all duration-200"
                >
                  ✦ 今すぐ無料でつくる
                </Link>
                <a
                  href="#how"
                  className="w-full sm:w-auto inline-flex items-center justify-center text-slate-300 font-semibold text-base px-7 py-4 rounded-2xl border border-white/15 hover:border-white/30 hover:text-white transition-colors"
                >
                  使い方を見る →
                </a>
              </div>

              {/* 3つの特徴バッジ */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-2">
                {[
                  { icon: "🤖", text: "AIが志望動機を自動生成" },
                  { icon: "📄", text: "JIS準拠PDF即ダウンロード" },
                  { icon: "🆓", text: "登録不要・完全無料" },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-xl px-3.5 py-2 backdrop-blur-sm"
                  >
                    <span className="text-sm">{b.icon}</span>
                    <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 右: フクロウキャラクター ── */}
            <div className="flex-shrink-0 flex items-end justify-center w-full lg:w-auto">
              {/* グロー効果 */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 scale-75 translate-y-8 bg-indigo-500 rounded-full blur-3xl opacity-25" />
                <Image
                  src="/images/owl-main.png"
                  alt="ジブキャリ キャラクター"
                  width={420}
                  height={420}
                  className="relative w-[220px] sm:w-[300px] lg:w-[400px] xl:w-[440px] object-contain"

                  priority
                />
              </div>
            </div>

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
      <section id="how" className="py-14 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">How it works</p>
            <h2 className="text-3xl font-black">たった3ステップで完成</h2>
            <p className="text-slate-500 text-base">難しい操作は一切なし。フォームに答えるだけ。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* コネクター矢印 */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 text-sm font-bold shadow-sm">
                    →
                  </div>
                )}
                {/* 背景の大きな数字 */}
                <div className="absolute -top-3 -right-1 text-[7.5rem] font-black leading-none text-slate-50 select-none pointer-events-none">
                  {s.n}
                </div>
                {/* アイコン円 */}
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center text-3xl mb-5 shadow-sm">
                  {s.icon}
                </div>
                {/* ステップ番号 */}
                <p className="text-xs font-bold text-indigo-500 tracking-widest uppercase mb-1.5">Step {s.n}</p>
                {/* タイトル */}
                <p className="font-black text-xl text-slate-900 mb-2.5">{s.title}</p>
                {/* 説明文 */}
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{s.body}</p>
                {/* ヒントバッジ */}
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                  <span className="text-emerald-500">✓</span> {s.hint}
                </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOC_TYPES.map((d) => (
              <Link key={d.href} href={d.href}>
                <div className={`group relative overflow-hidden rounded-2xl ${d.bg} border-2 ${d.border} p-5 flex items-center gap-5 min-h-[130px] transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer`}>
                  {/* 左グラデーションバー */}
                  <div className={`absolute inset-y-0 left-0 w-2 rounded-l-2xl bg-gradient-to-b ${d.color}`} />
                  {/* 絵文字ボックス */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white shadow-sm border border-white flex items-center justify-center text-4xl">
                    {d.emoji}
                  </div>
                  {/* テキスト */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-lg text-slate-900">{d.label}</p>
                      {d.badge && (
                        <span className={`${d.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                          {d.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 leading-snug">{d.sub}</p>
                  </div>
                  {/* 矢印ボタン */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${d.color} flex items-center justify-center text-white text-sm font-bold shadow-md opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200`}>
                    →
                  </div>
                </div>
              </Link>
            ))}
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
