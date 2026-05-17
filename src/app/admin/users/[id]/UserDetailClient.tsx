"use client";

import { useState } from "react";
import {
  User, Mail, Phone, MapPin, Calendar, Badge,
  FileText, GraduationCap, Briefcase, Award,
  Download, MessageSquare, UserPlus, Pencil, LogIn,
} from "lucide-react";
import type { AdminUser, AdminResume, ActionLog } from "@/lib/adminMockData";

type TabId = "profile" | "resumes" | "logs";

const FORMAT_LABELS: Record<string, string> = {
  jis: "JIS規格",
  career_change: "転職用",
  new_graduate: "新卒用",
  part_time: "アルバイト用",
};

const FORMAT_COLORS: Record<string, string> = {
  jis: "bg-slate-100 text-slate-700",
  career_change: "bg-indigo-100 text-indigo-700",
  new_graduate: "bg-emerald-100 text-emerald-700",
  part_time: "bg-amber-100 text-amber-700",
};

const GENDER_LABELS: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

// ── Action Log Config ─────────────────────────────────────────────────────────

import type { ComponentType } from "react";

type IconComponent = ComponentType<{ className?: string }>;

interface ActionCfg {
  label: string;
  icon: IconComponent;
  dotColor: string;
  iconColor: string;
  bg: string;
}

const ACTION_CFG: Record<string, ActionCfg> = {
  pdf_download:      { label: "PDFダウンロード",   icon: Download,      dotColor: "bg-indigo-500",  iconColor: "text-indigo-600",  bg: "bg-indigo-50"  },
  pdf_email:         { label: "メール転送",         icon: Mail,          dotColor: "bg-violet-500",  iconColor: "text-violet-600",  bg: "bg-violet-50"  },
  interview_request: { label: "面談リクエスト",     icon: MessageSquare, dotColor: "bg-amber-500",   iconColor: "text-amber-600",   bg: "bg-amber-50"   },
  resume_created:    { label: "履歴書作成",         icon: FileText,      dotColor: "bg-emerald-500", iconColor: "text-emerald-600", bg: "bg-emerald-50" },
  resume_updated:    { label: "履歴書更新",         icon: Pencil,        dotColor: "bg-blue-500",    iconColor: "text-blue-600",    bg: "bg-blue-50"    },
  register:          { label: "新規登録",           icon: UserPlus,      dotColor: "bg-green-500",   iconColor: "text-green-600",   bg: "bg-green-50"   },
  login:             { label: "ログイン",           icon: LogIn,         dotColor: "bg-slate-400",   iconColor: "text-slate-500",   bg: "bg-slate-100"  },
};

const DEFAULT_LOG_CFG: ActionCfg = {
  label: "アクション", icon: LogIn, dotColor: "bg-slate-400", iconColor: "text-slate-500", bg: "bg-slate-100",
};

function getLogCfg(action: string): ActionCfg {
  return ACTION_CFG[action] ?? DEFAULT_LOG_CFG;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function yearMonth(y?: number, m?: number) {
  if (!y) return "—";
  return `${y}年${m ? `${m}月` : ""}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: AdminUser }) {
  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: IconComponent;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-semibold mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );

  const StatBadge = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <div className="text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Activity stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">アクティビティ統計</p>
        <div className="grid grid-cols-3 gap-4">
          <StatBadge label="PDF書き出し" value={user.pdfDownloadCount} color="text-indigo-600" />
          <StatBadge label="メール転送" value={user.pdfEmailCount} color="text-violet-600" />
          <StatBadge label="面談リクエスト" value={user.interviewButtonCount} color="text-amber-600" />
        </div>
      </div>

      {/* Personal info grid */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">基本情報</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={User} label="氏名" value={`${user.lastName} ${user.firstName}`} />
          <InfoRow icon={User} label="氏名（カナ）" value={`${user.lastNameKana} ${user.firstNameKana}`} />
          <InfoRow icon={Mail} label="メールアドレス" value={user.email} />
          <InfoRow icon={Phone} label="電話番号" value={user.phone} />
          <InfoRow icon={Calendar} label="生年月日" value={user.birthDate} />
          <InfoRow icon={Badge as IconComponent} label="性別" value={GENDER_LABELS[user.gender] ?? user.gender} />
          <InfoRow
            icon={MapPin}
            label="住所"
            value={`〒${user.postalCode} ${user.prefecture}${user.city}${user.streetAddress}`}
          />
          <InfoRow icon={Calendar} label="登録日" value={fmtDate(user.registeredAt)} />
        </div>
      </div>
    </div>
  );
}

function ResumesSection({ resumes }: { resumes: AdminResume[] }) {
  const [openId, setOpenId] = useState<string | null>(resumes[0]?.id ?? null);

  if (resumes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400">履歴書データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((resume) => {
        const open = openId === resume.id;
        return (
          <div key={resume.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setOpenId(open ? null : resume.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{resume.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    作成: {fmtDate(resume.createdAt)} ／ 更新: {fmtDate(resume.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${FORMAT_COLORS[resume.format]}`}>
                  {FORMAT_LABELS[resume.format]}
                </span>
                <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Body */}
            {open && (
              <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-6">
                {/* Education */}
                {resume.education.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">学歴</p>
                    </div>
                    <div className="space-y-2 pl-6">
                      {resume.education.map((edu, i) => (
                        <div key={i} className="text-sm text-slate-700">
                          <span className="font-semibold">{edu.school}</span>
                          {edu.department && <span className="text-slate-500"> {edu.department}</span>}
                          <span className="text-slate-400 ml-2 text-xs">
                            {yearMonth(edu.entryYear, edu.entryMonth)} 〜 {yearMonth(edu.exitYear, edu.exitMonth)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work history */}
                {resume.workHistory.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-violet-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">職歴</p>
                    </div>
                    <div className="space-y-3 pl-6">
                      {resume.workHistory.map((w, i) => (
                        <div key={i} className="border-l-2 border-slate-200 pl-4">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{w.company}</span>
                            <span className="text-xs text-slate-500">{w.position}</span>
                            {w.isCurrent && (
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                現職
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {yearMonth(w.entryYear, w.entryMonth)} 〜{" "}
                            {w.isCurrent ? "現在" : yearMonth(w.exitYear, w.exitMonth)}
                          </p>
                          {w.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{w.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Licenses */}
                {resume.licenses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">資格・免許</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {resume.licenses.map((l, i) => (
                        <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
                          {l.name}（{l.year}年{l.month}月）
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivation */}
                {resume.motivation && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">志望動機</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                      {resume.motivation}
                    </p>
                  </div>
                )}

                {/* Self PR */}
                {resume.selfPR && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">自己PR</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                      {resume.selfPR}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LogsSection({ logs }: { logs: ActionLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400">アクションログがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="relative">
        {logs.map((log, idx) => {
          const cfg = getLogCfg(log.action);
          const Icon = cfg.icon;
          const isLast = idx === logs.length - 1;
          return (
            <div key={log.id} className="flex gap-4">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 z-10`}>
                  <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-slate-100 mt-1 mb-1" />}
              </div>

              {/* Content */}
              <div className={`flex-1 ${!isLast ? "pb-5" : ""} pt-1.5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{log.label}</p>
                    {log.detail && (
                      <p className="text-xs text-slate-500 mt-0.5">{log.detail}</p>
                    )}
                  </div>
                  <time className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                    {fmtDateTime(log.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  user: AdminUser;
  resumes: AdminResume[];
  actionLogs: ActionLog[];
}

const TABS: { id: TabId; label: string; icon: IconComponent }[] = [
  { id: "profile", label: "基本情報", icon: User },
  { id: "resumes", label: "履歴書データ", icon: FileText },
  { id: "logs", label: "行動ログ", icon: MessageSquare },
];

export function UserDetailClient({ user, resumes, actionLogs }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6">
      {/* User header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-2xl">{user.lastName[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-900">
            {user.lastName} {user.firstName}
            <span className="ml-2 text-base font-medium text-slate-400">
              {user.lastNameKana} {user.firstNameKana}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              {user.id}
            </span>
            <span className="text-xs text-slate-400">
              登録: {new Date(user.registeredAt).toLocaleDateString("ja-JP")}
            </span>
            <span className="text-xs text-slate-400">
              履歴書: {resumes.length}件
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === "resumes" && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === id ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"}`}>
                {resumes.length}
              </span>
            )}
            {id === "logs" && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === id ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"}`}>
                {actionLogs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && <ProfileSection user={user} />}
      {activeTab === "resumes" && <ResumesSection resumes={resumes} />}
      {activeTab === "logs" && <LogsSection logs={actionLogs} />}
    </div>
  );
}
