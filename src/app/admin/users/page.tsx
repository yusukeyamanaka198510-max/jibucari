import type { Metadata } from "next";
import { Users } from "lucide-react";
import { UsersClient } from "./UsersClient";

export const metadata: Metadata = { title: "ユーザー管理 | ジブキャリ管理" };

export default function AdminUsersPage() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">ユーザー管理</h1>
          <p className="text-sm text-slate-500">登録ユーザーの一覧・行動統計を確認できます</p>
        </div>
      </div>

      <UsersClient />
    </div>
  );
}
