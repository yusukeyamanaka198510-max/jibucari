import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "プライバシーポリシー | ジブキャリ" };

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-black text-slate-900 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-slate-400 mb-10">最終更新日：2025年5月17日</p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8 text-slate-700 text-sm leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. 収集する情報</h2>
            <p>当サービスは以下の情報を収集します。</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>アカウント情報：</strong>Googleアカウントより取得するメールアドレス・氏名・プロフィール画像</li>
              <li><strong>入力情報：</strong>氏名・生年月日・住所・電話番号・学歴・職歴など、書類作成のためにユーザーが入力した情報</li>
              <li><strong>利用情報：</strong>アクセスログ・デバイス情報・Cookie情報</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. 情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>書類作成・保存・PDF出力サービスの提供</li>
              <li>ユーザーへのサービス通知・お問い合わせ対応</li>
              <li>キャリアアドバイザーによるスカウト・求人紹介（同意した場合のみ）</li>
              <li>サービス改善のための統計分析</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. 第三者への提供</h2>
            <p>当サービスは、以下の場合を除き、個人情報を第三者へ提供しません。</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づき開示が要求された場合</li>
              <li>サービス運営に必要な業務委託先（データは適切に保護）</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. データの管理</h2>
            <p>ユーザーデータは、Supabase（米国）のサーバーで管理されます。データは暗号化して保存・送受信されます。ユーザーはいつでもアカウントを削除し、保存されたデータを削除することができます。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Cookieの使用</h2>
            <p>当サービスはセッション管理のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">6. 未成年者の利用</h2>
            <p>16歳未満の方は保護者の同意のもとでご利用ください。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">7. お問い合わせ</h2>
            <p>プライバシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">8. ポリシーの変更</h2>
            <p>当サービスは、必要に応じて本ポリシーを変更します。重要な変更がある場合はサービス上でお知らせします。</p>
          </section>

        </div>
      </main>
    </div>
  );
}
