// ────────────────────────────────────────────────────────────
// 管理画面専用の TypeScript 型定義
// ────────────────────────────────────────────────────────────

export type EducationLevel =
  | "middle"
  | "high"
  | "high_dropout"
  | "uni"
  | "uni_dropout"
  | "grad"
  | "grad_dropout"
  | "enrolled";

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  middle:       "中卒",
  high:         "高卒",
  high_dropout: "高校中退",
  uni:          "大卒",
  uni_dropout:  "大学中退",
  grad:         "大学院卒",
  grad_dropout: "大学院中退",
  enrolled:     "在学中",
};

export type JobHuntStatus =
  | "new_grad"
  | "second_new_grad"
  | "first_job"
  | "career_change";

export const JOB_HUNT_STATUS_LABELS: Record<JobHuntStatus, string> = {
  new_grad:        "新卒",
  second_new_grad: "第二新卒",
  first_job:       "就職",
  career_change:   "転職",
};

// ── ユーザー ──────────────────────────────────────────────

export interface AdminUserProfile {
  id: string;
  email: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  gender: string;
  prefecture: string;
  educationLevel: EducationLevel | null;
  jobHuntStatus: JobHuntStatus | null;
  desiredIndustry: string[] | null;
  lastActiveAt: string | null;
  createdAt: string;
  // 集計
  resumeCount: number;
  actionCount: number;
  pdfDownloadCount: number;
  pdfEmailCount: number;
  interviewCount: number;
  tags: string[];
}

export interface AdminUserDetail extends AdminUserProfile {
  resumes: AdminResumeRow[];
  recentActions: ActionLogRow[];
  contactLogs: ContactLogRow[];
}

export interface AdminResumeRow {
  id: string;
  title: string;
  format: string;
  createdAt: string;
  updatedAt: string;
}

// ── アクションログ ────────────────────────────────────────

export type ActionType =
  | "pdf_download"
  | "pdf_email"
  | "interview_request"
  | "resume_created"
  | "resume_updated"
  | "resume_deleted"
  | "login"
  | "register"
  | "page_view"
  | "profile_updated";

export interface ActionLogRow {
  id: string;
  userId: string;
  actionType: ActionType;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ── コンタクトログ ────────────────────────────────────────

export type ContactType = "email" | "note" | "phone" | "meeting";

export interface ContactLogRow {
  id: string;
  userId: string;
  adminId: string | null;
  contactType: ContactType;
  subject: string | null;
  body: string;
  sentAt: string | null;
  createdAt: string;
}

export interface CreateContactLogInput {
  contactType: ContactType;
  subject?: string;
  body: string;
  sentAt?: string;
}

// ── ユーザータグ ──────────────────────────────────────────

export interface UserTagRow {
  id: string;
  userId: string;
  tag: string;
  createdAt: string;
}

// ── 統計 / ダッシュボード ─────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalResumes: number;
  totalActions: number;
  actionBreakdown: Record<string, number>;
  segmentByEducation: SegmentItem[];
  segmentByGender: SegmentItem[];
  segmentByJobStatus: SegmentItem[];
  segmentByPrefecture: SegmentItem[];
  timeSeries: TimeSeriesPoint[];
}

export interface SegmentItem {
  key: string;
  label: string;
  count: number;
  percent: number;
}

export interface TimeSeriesPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
  pdfDownloads: number;
  pdfEmails: number;
  interviewRequests: number;
}

// ── メール配信 ────────────────────────────────────────────

export type CampaignStatus = "draft" | "sending" | "sent" | "failed";

export interface EmailCampaignRow {
  id: string;
  adminId: string | null;
  campaignType: "bulk" | "individual";
  subject: string;
  bodyHtml: string;
  filterConditions: Record<string, unknown>;
  recipientCount: number;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  campaignType?: "bulk" | "individual";
  subject: string;
  bodyHtml: string;
  filterConditions?: Record<string, unknown>;
  scheduledAt?: string;
}

export interface EmailSendLogRow {
  id: string;
  campaignId: string | null;
  userId: string | null;
  toEmail: string;
  status: "pending" | "sent" | "failed" | "bounced";
  errorMsg: string | null;
  sentAt: string | null;
  createdAt: string;
}

// ── 記事 ──────────────────────────────────────────────────

export type ArticleStatus = "draft" | "published" | "archived";
export type ArticleCategory = "advice" | "real_story" | "news" | "tips";

export interface ArticleRow {
  id: string;
  authorId: string | null;
  title: string;
  slug: string | null;
  content: string;
  excerpt: string | null;
  category: ArticleCategory;
  status: ArticleStatus;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertArticleInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: ArticleCategory;
  status?: ArticleStatus;
  thumbnailUrl?: string;
  publishedAt?: string;
}

// ── 管理者操作ログ ────────────────────────────────────────

export interface AdminOperationLogRow {
  id: string;
  adminId: string | null;
  operationType: string;
  targetType: string;
  targetId: string | null;
  summary: string | null;
  diff: Record<string, unknown>;
  createdAt: string;
}

// ── ページトラッキング ─────────────────────────────────────

export interface PageSessionInput {
  sessionKey: string;
  page: string;
  userId?: string;
}

export interface PageSessionEndInput {
  sessionKey: string;
  exitField?: string;
  isCompleted?: boolean;
}

export interface PageEventInput {
  sessionKey: string;
  eventType: "field_focus" | "field_blur" | "field_input" | "scroll" | "submit" | "exit";
  fieldName?: string;
  valueLength?: number;
  scrollPct?: number;
}

// ── 検索フィルター ────────────────────────────────────────

export interface UserSearchFilters {
  q?: string;
  educationLevel?: EducationLevel;
  jobHuntStatus?: JobHuntStatus;
  prefecture?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  tag?: string;
  actionType?: ActionType;
  registeredFrom?: string;
  registeredTo?: string;
  sortBy?: "created_at" | "last_active_at";
  sortDir?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
