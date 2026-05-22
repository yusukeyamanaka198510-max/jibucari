"use client";

import { useCallback, useEffect, useState } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Download,
  MessageSquare,
  UserPlus,
  Pencil,
  LogIn,
  Phone,
  RefreshCw,
  Tag,
  Plus,
  Trash2,
  X,
  ClipboardList,
} from "lucide-react";
import type { ComponentType } from "react";
import type {
  AdminUserProfile,
  AdminResumeRow,
  ActionLogRow,
  ContactLogRow,
  UserTagRow,
  ActionType,
  ContactType,
} from "@/types/admin";
import { EDUCATION_LEVEL_LABELS, JOB_HUNT_STATUS_LABELS } from "@/types/admin";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DetailResponse {
  data: {
    profile: AdminUserProfile;
    resumes: AdminResumeRow[];
    actionLogs: ActionLogRow[];
    contactLogs: ContactLogRow[];
    userTags: UserTagRow[];
    pageSessions: unknown[];
  };
}

type TabId = "profile" | "logs" | "contact" | "tags";

type IconComponent = ComponentType<{ className?: string }>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Action log config ─────────────────────────────────────────────────────────

interface ActionCfg {
  label: string;
  icon: IconComponent;
  iconColor: string;
  bg: string;
}

const ACTION_CFG: Partial<Record<ActionType, ActionCfg>> = {
  pdf_download:    { label: "PDFダウンロード", icon: Download,      iconColor: "text-indigo-600", bg: "bg-indigo-50" },
  pdf_email:       { label: "メール転送",       icon: Mail,          iconColor: "text-violet-600", bg: "bg-violet-50" },
  interview_request: { label: "面談リクエスト", icon: MessageSquare, iconColor: "text-amber-600",  bg: "bg-amber-50"  },
  resume_created:  { label: "履歴書作成",       icon: FileText,      iconColor: "text-emerald-600",bg: "bg-emerald-50"},
  resume_updated:  { label: "履歴書更新",       icon: Pencil,        iconColor: "text-blue-600",   bg: "bg-blue-50"   },
  resume_deleted:  { label: "履歴書削除",       icon: Trash2,        iconColor: "text-red-600",    bg: "bg-red-50"    },
  register:        { label: "新規登録",         icon: UserPlus,      iconColor: "text-green-600",  bg: "bg-green-50"  },
  login:           { label: "ログイン",         icon: LogIn,         iconColor: "text-slate-500",  bg: "bg-slate-100" },
  profile_updated: { label: "プロフィール更新", icon: RefreshCw,     iconColor: "text-cyan-600",   bg: "bg-cyan-50"   },
  page_view:       { label: "ページ閲覧",       icon: LogIn,         iconColor: "text-slate-400",  bg: "bg-slate-100" },
};

const DEFAULT_CFG: ActionCfg = {
  label: "アクション",
  icon: LogIn,
  iconColor: "text-slate-400",
  bg: "bg-slate-100",
};

function getActionCfg(type: ActionType): ActionCfg {
  return ACTION_CFG[type] ?? DEFAULT_CFG;
}

// ── Contact type config ───────────────────────────────────────────────────────

const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  note: "ノート",
  email: "メール",
  phone: "電話",
  meeting: "面談",
};

const CONTACT_TYPE_COLORS: Record<ContactType, string> = {
  note: "bg-slate-100 text-slate-700",
  email: "bg-indigo-100 text-indigo-700",
  phone: "bg-emerald-100 text-emerald-700",
  meeting: "bg-amber-100 text-amber-700",
};

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab({ profile }: { profile: AdminUserProfile }) {
  const InfoRow = ({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) => (
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

  const GENDER_LABELS: Record<string, string> = { male: "男性", female: "女性", other: "その他" };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">アクティビティ統計</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          {[
            { label: "履歴書", value: profile.resumeCount, color: "text-slate-700" },
            { label: "アクション", value: profile.actionCount, color: "text-slate-700" },
            { label: "PDFダウンロード", value: profile.pdfDownloadCount, color: "text-indigo-600" },
            { label: "メール転送", value: profile.pdfEmailCount, color: "text-violet-600" },
            { label: "面談リクエスト", value: profile.interviewCount, color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">基本情報</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={User}     label="氏名"           value={`${profile.lastName} ${profile.firstName}`} />
          <InfoRow icon={User}     label="氏名（カナ）"   value={`${profile.lastNameKana} ${profile.firstNameKana}`} />
          <InfoRow icon={Mail}     label="メールアドレス" value={profile.email} />
          <InfoRow icon={Calendar} label="生年月日"       value={profile.birthDate ? fmtDate(profile.birthDate) : "—"} />
          <InfoRow icon={User}     label="性別"           value={GENDER_LABELS[profile.gender] ?? profile.gender ?? "—"} />
          <InfoRow icon={MapPin}   label="都道府県"       value={profile.prefecture ?? "—"} />
          <InfoRow icon={ClipboardList} label="学歴"      value={profile.educationLevel ? (EDUCATION_LEVEL_LABELS[profile.educationLevel] ?? "—") : "—"} />
          <InfoRow icon={Phone}    label="求職状況"       value={profile.jobHuntStatus ? (JOB_HUNT_STATUS_LABELS[profile.jobHuntStatus] ?? "—") : "—"} />
          <InfoRow icon={Calendar} label="登録日"         value={fmtDate(profile.createdAt)} />
          <InfoRow icon={Calendar} label="最終アクティブ" value={profile.lastActiveAt ? fmtDateTime(profile.lastActiveAt) : "—"} />
        </div>
      </div>

      {/* Tags */}
      {profile.tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">タグ</p>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                <Tag className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Action logs ──────────────────────────────────────────────────────────

function LogsTab({ logs }: { logs: ActionLogRow[] }) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400">行動ログがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="relative">
        {logs.map((log, idx) => {
          const cfg = getActionCfg(log.actionType);
          const Icon = cfg.icon;
          const isLast = idx === logs.length - 1;
          return (
            <div key={log.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 z-10`}>
                  <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-slate-100 mt-1 mb-1" />}
              </div>
              <div className={`flex-1 ${!isLast ? "pb-5" : ""} pt-1.5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                    {log.targetId && (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {log.targetId}</p>
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

// ── Tab: Contact logs ─────────────────────────────────────────────────────────

function ContactTab({
  userId,
  logs: initialLogs,
}: {
  userId: string;
  logs: ContactLogRow[];
}) {
  const [logs, setLogs] = useState<ContactLogRow[]>(initialLogs);
  const [contactType, setContactType] = useState<ContactType>("note");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/contact-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactType, subject: subject || undefined, body }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = (await res.json()) as { data: ContactLogRow };
      setLogs((prev) => [json.data, ...prev]);
      setBody("");
      setSubject("");
      setContactType("note");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    setDeleting(logId);
    try {
      await fetch(`/api/admin/users/${userId}/contact-logs?logId=${encodeURIComponent(logId)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">対応を追加</p>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value as ContactType)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {(Object.entries(CONTACT_TYPE_LABELS) as [ContactType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="件名（任意）"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="対応内容を入力..."
            rows={3}
            required
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {submitting ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">対応履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONTACT_TYPE_COLORS[log.contactType]}`}>
                    {CONTACT_TYPE_LABELS[log.contactType]}
                  </span>
                  {log.subject && (
                    <span className="text-sm font-semibold text-slate-700">{log.subject}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <time className="text-xs text-slate-400 whitespace-nowrap">
                    {fmtDateTime(log.createdAt)}
                  </time>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deleting === log.id}
                    className="text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{log.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Tags ─────────────────────────────────────────────────────────────────

function TagsTab({ userId, initialTags }: { userId: string; initialTags: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t || tags.includes(t)) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: t }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setTags((prev) => [...prev, t]);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (tag: string) => {
    setRemoving(tag);
    try {
      await fetch(`/api/admin/users/${userId}/tags?tag=${encodeURIComponent(tag)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      setTags((prev) => prev.filter((t) => t !== tag));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
      {/* Add tag form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタグを入力..."
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="submit"
          disabled={adding || !input.trim()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          追加
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Tag chips */}
      {tags.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">タグがありません</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-indigo-100"
            >
              <Tag className="w-3.5 h-3.5" />
              {t}
              <button
                onClick={() => handleRemove(t)}
                disabled={removing === t}
                className="ml-0.5 text-indigo-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  userId: string;
}

const TABS: { id: TabId; label: string; icon: IconComponent }[] = [
  { id: "profile", label: "プロフィール", icon: User },
  { id: "logs",    label: "行動ログ",     icon: ClipboardList },
  { id: "contact", label: "対応履歴",     icon: MessageSquare },
  { id: "tags",    label: "タグ",         icon: Tag },
];

export function UserDetailClient({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [detail, setDetail] = useState<DetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnavailable(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
      if (res.status === 503) { setUnavailable(true); return; }
      if (!res.ok) { setError(`エラー: ${res.status}`); return; }
      const json = (await res.json()) as DetailResponse;
      setDetail(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void fetchDetail(); }, [fetchDetail]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 h-24" />
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-64 h-11" />
        <div className="bg-white rounded-2xl border border-slate-100 h-64" />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
        Supabase未接続のため表示できません
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
        {error ?? "データを取得できませんでした"}
      </div>
    );
  }

  const { profile, actionLogs, contactLogs, userTags } = detail;

  const tabCounts: Partial<Record<TabId, number>> = {
    logs: actionLogs.length,
    contact: contactLogs.length,
    tags: userTags.length,
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-2xl">
            {profile.lastName[0] ?? "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-900">
            {profile.lastName} {profile.firstName}
            <span className="ml-2 text-base font-medium text-slate-400">
              {profile.lastNameKana} {profile.firstNameKana}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              {profile.id}
            </span>
            <span className="text-xs text-slate-400">
              登録: {new Date(profile.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = tabCounts[id];
          return (
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
              {count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === id ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && <ProfileTab profile={profile} />}
      {activeTab === "logs"    && <LogsTab logs={actionLogs} />}
      {activeTab === "contact" && <ContactTab userId={userId} logs={contactLogs} />}
      {activeTab === "tags"    && <TagsTab userId={userId} initialTags={userTags.map((t) => t.tag)} />}
    </div>
  );
}
