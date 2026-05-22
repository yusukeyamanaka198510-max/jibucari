import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "利用規約 | ジブキャリ" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ジブキャリ
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600">← TOPへ戻る</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">利用規約</h1>
        <p className="text-sm text-slate-400 mb-10">最終更新日：2025年5月17日</p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8 text-slate-700 text-sm leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第1条（適用）</h2>
            <p>本利用規約（以下「本規約」）は、ジブキャリ（以下「当サービス」）が提供する履歴書・職務経歴書作成サービスの利用に関して、当サービスとユーザーの間の権利義務関係を定めるものです。ユーザーは本規約に同意のうえ、当サービスをご利用ください。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第2条（サービスの内容）</h2>
            <p>当サービスは、以下のサービスを提供します。</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>履歴書・職務経歴書・スキルシート・送付状の作成・編集・PDF出力</li>
              <li>作成した書類の保存・管理</li>
              <li>プロフィール情報の登録・管理</li>
              <li>キャリアアドバイザーによるスカウト・求人紹介（任意）</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第3条（アカウント登録）</h2>
            <p>ユーザーは、Googleアカウントを用いてアカウントを作成することができます。登録情報は正確かつ最新の状態に保つ責任を負います。アカウントの不正利用・第三者への譲渡・貸与は禁止します。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第4条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>法令または公序良俗に違反する行為</li>
              <li>当サービスのシステムへの不正アクセス・干渉行為</li>
              <li>他のユーザーや第三者への迷惑行為・権利侵害</li>
              <li>虚偽・誤解を招く情報の登録</li>
              <li>当サービスの信用を毀損する行為</li>
              <li>当サービスが許可しない商業目的での利用</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第5条（免責事項）</h2>
            <p>当サービスは、提供する機能の完全性・正確性・継続性を保証しません。当サービスの利用によって生じた損害について、当サービスは一切責任を負いません。また、ユーザーが作成した書類の採用・選考結果についても責任を負いません。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第6条（サービスの変更・停止）</h2>
            <p>当サービスは、ユーザーへの事前通知なく、サービス内容の変更・停止・終了を行う場合があります。これによりユーザーに損害が生じた場合、当サービスは責任を負いません。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第7条（知的財産権）</h2>
            <p>当サービスのコンテンツ・デザイン・ロゴ等の知的財産権は当サービスに帰属します。ユーザーが作成した書類の著作権はユーザーに帰属します。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第8条（規約の変更）</h2>
            <p>当サービスは、必要に応じて本規約を変更できるものとします。変更後の規約はサービス上での掲載をもって効力を生じます。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">第9条（準拠法・管轄）</h2>
            <p>本規約は日本法に準拠します。当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </section>

        </div>
      </main>
    </div>
  );
}
