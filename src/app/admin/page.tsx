import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Download,
  Mail,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Pencil,
} from "lucide-react";
import {
  getAdminStats,
  getRecentLogs,
  MOCK_USERS,
  getUserRegistrationTrend,
  getAccessTrend,
  getEducationSegments,
  type ActionLog,
} from "@/lib/adminMockData";
import { DashboardStats } from "./DashboardStats";
import { DashboardChartsClient } from "./DashboardChartsClient";

export const metadata: Metadata = { title: "ダッシュボード | ジブキャリ管理" };

interface ActionCfg {
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const ACTION_CONFIG: Record<string, ActionCfg> = {
  pdf_download:      { label: "PDFダウンロード",    icon: Download,      color: "text-indigo-600", bg: "bg-indigo-100" },
  pdf_email:         { label: "メール転送",          icon: Mail,          color: "text-violet-600", bg: "bg-violet-100" },
  interview_request: { label: "面談リクエスト",      icon: MessageSquare, color: "text-amber-600",  bg: "bg-amber-100"  },
  resume_created:    { label: "履歴書作成",          icon: FileText,      color: "text-emerald-600",bg: "bg-emerald-100"},
  resume_updated:    { label: "履歴書更新",          icon: Pencil,        color: "text-blue-600",   bg: "bg-blue-100"   },
  register:          { label: "新規登録",            icon: UserPlus,      color: "text-green-600",  bg: "bg-green-100"  },
  login:             { label: "ログイン",            icon: Users,         color: "text-slate-600",  bg: "bg-slate-100"  },
};

const DEFAULT_CFG: ActionCfg = { label: "アクション", icon: Users, color: "text-slate-600", bg: "bg-slate-100" };

function getActionCfg(action: string): ActionCfg {
  return ACTION_CONFIG[action] ?? DEFAULT_CFG;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUserName(userId: string) {
  const u = MOCK_USERS.find((u) => u.id === userId);
  return u ? `${u.lastName} ${u.firstName}` : userId;
}

function ActivityItem({ log }: { log: ActionLog }) {
  const cfg = getActionCfg(log.action);
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          <span className="font-semibold">{getUserName(log.userId)}</span>
          {" "}が{log.label}
        </p>
        {log.detail && (
          <p className="text-xs text-slate-500 truncate">{log.detail}</p>
        )}
      </div>
      <time className="text-xs text-slate-400 shrink-0 pt-0.5">{formatDateTime(log.createdAt)}</time>
    </div>
  );
}

export default function AdminDashboardPage() {
  const stats = getAdminStats();
  const recentLogs = getRecentLogs(15);
  const userTrend = getUserRegistrationTrend();
  const accessTrend = getAccessTrend();
  const educationSegments = getEducationSegments();

  const topUsers = [...MOCK_USERS]
    .sort(
      (a, b) =>
        b.pdfDownloadCount + b.pdfEmailCount + b.interviewButtonCount -
        (a.pdfDownloadCount + a.pdfEmailCount + a.interviewButtonCount)
    )
    .slice(0, 5);

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-1">ジブキャリの利用状況サマリー</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <TrendingUp className="w-3.5 h-3.5" />
          モックデータ表示中
        </div>
      </div>

      {/* Stats grid */}
      <DashboardStats
        totalUsers={stats.totalUsers}
        totalResumes={stats.totalResumes}
        totalPdfDownloads={stats.totalPdfDownloads}
        totalPdfEmails={stats.totalPdfEmails}
        totalInterviewRequests={stats.totalInterviewRequests}
      />

      {/* Analytics Charts（クリックで日次・月次詳細を表示） */}
      <DashboardChartsClient
        userTrend={userTrend}
        accessTrend={accessTrend}
        educationSegments={educationSegments}
      />

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">最近のアクティビティ</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              すべて見る <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-6 divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
            {recentLogs.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        </div>

        {/* Top active users */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">アクティブユーザー TOP5</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              一覧へ <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {topUsers.map((user, idx) => {
              const total =
                user.pdfDownloadCount + user.pdfEmailCount + user.interviewButtonCount;
              return (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="w-6 text-center text-sm font-black text-slate-300">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-indigo-700 font-bold text-sm">
                      {user.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.lastName} {user.firstName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{total}</p>
                    <p className="text-xs text-slate-400">総アクション</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
