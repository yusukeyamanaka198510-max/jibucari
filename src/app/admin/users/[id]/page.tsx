import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import {
  getUserById,
  getResumesByUserId,
  getActionLogsByUserId,
} from "@/lib/adminMockData";
import { UserDetailClient } from "./UserDetailClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = getUserById(params.id);
  if (!u) return { title: "ユーザーが見つかりません" };
  return { title: `${u.lastName} ${u.firstName} | ジブキャリ管理` };
}

export default function AdminUserDetailPage({ params }: Props) {
  const found = getUserById(params.id);
  if (!found) notFound();
  const user = found as NonNullable<typeof found>;

  const resumes = getResumesByUserId(params.id);
  const actionLogs = getActionLogsByUserId(params.id);

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
        <span className="text-slate-700 font-semibold">
          {user.lastName} {user.firstName}
        </span>
      </nav>

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">ユーザー詳細</h1>
          <p className="text-sm text-slate-500">
            {user.lastName} {user.firstName} さんの詳細情報
          </p>
        </div>
      </div>

      <UserDetailClient user={user} resumes={resumes} actionLogs={actionLogs} />
    </div>
  );
}
