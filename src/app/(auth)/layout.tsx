import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 左パネル：ブランドビジュアル（PC のみ表示） */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
      >
        {/* 背景装飾 */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 bg-violet-900/30 rounded-full blur-3xl" />

        {/* ロゴ */}
        <Link href="/" className="relative text-2xl font-black tracking-tight">
          ジブキャリ
        </Link>

        {/* キャッチコピー */}
        <div className="relative space-y-4">
          <blockquote className="text-3xl font-black leading-snug">
            "自分のキャリアを、<br />自分の言葉で。"
          </blockquote>
          <p className="text-indigo-200 text-sm">
            履歴書・職務経歴書・スキルシートを<br />
            ブラウザだけで完結。完全無料。
          </p>
        </div>

        {/* フッター */}
        <p className="relative text-xs text-indigo-300">© 2025 ジブキャリ</p>
      </div>

      {/* 右パネル：フォーム */}
      <div className="flex flex-col bg-white">
        {/* TOPに戻るリンク */}
        <div className="p-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors"
          >
            ← TOPに戻る
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
