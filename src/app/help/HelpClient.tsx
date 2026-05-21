"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronDown, HelpCircle, Mail, Send,
  CheckCircle2, Loader2,
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    category: "📄 書類作成について",
    items: [
      {
        q: "ログインしなくても書類を作れますか？",
        a: "はい、ログインなしで書類の作成・入力まで行えます。PDFのダウンロードや保存にはGoogleアカウントでの登録が必要です（無料）。",
      },
      {
        q: "対応している書類の種類を教えてください。",
        a: "履歴書（JIS規格・転職用・新卒用・アルバイト用・写真なし）、職務経歴書、送付状・退職届、スキルシートの計4種類に対応しています。",
      },
      {
        q: "PDFの出力は有料ですか？",
        a: "完全無料です。すべての書類をPDF形式でダウンロードできます。クレジットカードの登録も不要です。",
      },
      {
        q: "作成した書類のデータは保存されますか？",
        a: "Googleアカウントでログインすると、作成した書類がクラウドに自動保存されます。次回ログイン時にマイページから確認・再編集できます。",
      },
      {
        q: "入力途中でブラウザを閉じてしまいました。データは残っていますか？",
        a: "未ログイン状態でも、ブラウザのローカルストレージに一時保存されます。同じブラウザ・端末から再度アクセスすると入力内容が復元されます。ただし、ブラウザのキャッシュをクリアすると削除されるため、ログインして保存することをおすすめします。",
      },
    ],
  },
  {
    category: "🤖 AI機能について",
    items: [
      {
        q: "AIで志望動機・自己PRを生成するにはどうすればいいですか？",
        a: "「AIサポート」ページで応募先・強み・経験などを入力してボタンを押すと、AIが文章のたたき台を作成します。生成した文章は履歴書にワンクリックで反映できます。",
      },
      {
        q: "AIが生成した文章をそのまま提出してもいいですか？",
        a: "AI生成文はあくまでたたき台です。そのまま提出せず、ご自身の経験や言葉に合わせて修正・加筆してからご使用ください。",
      },
      {
        q: "AI生成に失敗します。",
        a: "サーバーの混雑や一時的な障害が原因の場合があります。しばらく待ってから再度お試しください。改善しない場合はページ下部の問い合わせフォームよりご連絡ください。",
      },
    ],
  },
  {
    category: "👤 アカウント・個人情報について",
    items: [
      {
        q: "登録はどのようにしますか？",
        a: "Googleアカウントでのワンクリック登録に対応しています。PDFダウンロード時などに表示される登録モーダルから、Googleアカウントでサインインするだけで完了します。",
      },
      {
        q: "入力した個人情報はどこに保存されますか？",
        a: "ログイン状態で「個人情報を保存」を押すと、氏名・住所・学歴・職歴などがマイページに保存されます。次回の書類作成時に「保存済み情報を入力」ボタンで自動入力できます。",
      },
      {
        q: "アカウントを削除したい場合はどうすればいいですか？",
        a: "現在、アカウント削除はサポートへの問い合わせで対応しています。ページ下部の問い合わせフォームよりご連絡ください。",
      },
      {
        q: "個人情報の取り扱いを教えてください。",
        a: "入力データは書類作成のみに使用し、第三者への無断提供は行いません。詳しくはプライバシーポリシーをご確認ください。",
      },
    ],
  },
  {
    category: "🎯 スカウト・面談について",
    items: [
      {
        q: "スカウトはどのようにして届きますか？",
        a: "プロフィールを登録するとジブキャリのキャリアアドバイザーが内容を確認し、ご経験・スキルに合った求人や面談のご案内をメール等でお届けする場合があります。",
      },
      {
        q: "面談依頼はどこから申し込めますか？",
        a: "PDFダウンロード後に表示される面談依頼シート、または書類作成画面の「面談を申し込む」ボタンから申し込めます。ログインが必要です。",
      },
      {
        q: "面談は有料ですか？",
        a: "初回面談は無料です。キャリアアドバイザーが転職・就活のご相談に30〜60分対応します。",
      },
    ],
  },
];

interface ContactForm {
  name: string;
  email: string;
  category: string;
  message: string;
}

const CONTACT_CATEGORIES = [
  "書類作成・PDF出力について",
  "AI機能について",
  "アカウント・ログインについて",
  "スカウト・面談について",
  "その他",
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="flex items-start gap-2.5 text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
          <span className="text-indigo-400 font-bold flex-shrink-0 mt-0.5">Q.</span>
          {q}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-4 pl-6 pr-2">
          <p className="text-sm text-slate-600 leading-relaxed flex gap-2">
            <span className="text-violet-400 font-bold flex-shrink-0">A.</span>
            <span>{a}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export function HelpClient() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", category: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setSending(true);
    setSendError("");
    try {
      // メール送信API（問い合わせ用）
      const res = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setSendError("送信に失敗しました。しばらく経ってから再度お試しください。");
      }
    } catch {
      setSendError("通信エラーが発生しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />トップ
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-sm text-slate-700">ヘルプ・よくある質問</span>
          </div>
          <Link
            href="/resume/new"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            無料でつくる →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* タイトル */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">ヘルプ・よくある質問</h1>
            <p className="text-sm text-slate-500 mt-1">解決しない場合はページ下部のフォームよりお問い合わせください。</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 text-sm">{cat.category}</h2>
              </div>
              <div className="px-6">
                {cat.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 問い合わせフォーム */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <Mail className="h-5 w-5 text-indigo-500" />
            <div>
              <h2 className="font-bold text-slate-900">お問い合わせ</h2>
              <p className="text-xs text-slate-500 mt-0.5">通常2〜3営業日以内にご返答いたします。</p>
            </div>
          </div>

          <div className="p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="font-bold text-slate-800 text-lg">送信しました！</p>
                <p className="text-sm text-slate-500">担当者より2〜3営業日以内にご連絡いたします。</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", category: "", message: "" }); }}
                  className="mt-2 text-sm text-indigo-600 underline hover:text-indigo-800"
                >
                  別の内容を送る
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">お名前</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="山田 太郎"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      メールアドレス <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">お問い合わせの種類</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700"
                  >
                    <option value="">選択してください</option>
                    {CONTACT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    お問い合わせ内容 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="ご不明な点・ご要望をできるだけ詳しくご記入ください。"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300 resize-none"
                  />
                </div>

                {sendError && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{sendError}</p>
                )}

                <button
                  type="submit"
                  disabled={sending || !form.email || !form.message}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {sending
                    ? <><Loader2 className="h-4 w-4 animate-spin" />送信中...</>
                    : <><Send className="h-4 w-4" />送信する</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
