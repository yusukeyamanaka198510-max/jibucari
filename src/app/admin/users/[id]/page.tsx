import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { UserDetailClient } from "./UserDetailClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `ユーザー詳細 (${params.id}) | ジブキャリ管理` };
}

export default function AdminUserDetailPage({ params }: Props) {
  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          ユーザー管理
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold">ユーザー詳細</span>
      </nav>

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">ユーザー詳細</h1>
          <p className="text-sm text-slate-500">ユーザーの詳細情報・行動ログ・対応履歴を確認できます</p>
        </div>
      </div>

      <UserDetailClient userId={params.id} />
    </div>
  );
}
