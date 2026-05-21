// ─── 履歴書フォーマット ───────────────────────────────────────────────────────
export type ResumeFormat =
  | "jis"           // JIS規格（一般用）
  | "career_change" // 転職用
  | "new_graduate"  // 新卒用
  | "part_time"     // アルバイト用
  | "no_photo";     // 写真なし（WEB応募向け）

// ─── 選択肢型 ─────────────────────────────────────────────────────────────────
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type EducationEntryType = "enrolled" | "transferred_in";
export type EducationExitType = "graduated" | "dropped_out" | "transferred" | "study_abroad";
export type DocumentType = "resume" | "cv" | "cover_letter" | "resignation" | "skill_sheet";

// ─── 基本情報 ─────────────────────────────────────────────────────────────────
export interface PersonalInfo {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  /** ISO 8601: YYYY-MM-DD */
  birthDate: string;
  gender: Gender;
  postalCode: string;
  prefecture: string;
  city: string;
  streetAddress: string;
  building: string;
  addressKana: string;
  mobilePhone: string;
  email: string;
  /** Supabase Storage URL or base64 data URL */
  photoUrl?: string;
}

// ─── 学歴エントリ ─────────────────────────────────────────────────────────────
export interface EducationEntry {
  id: string;
  school: string;
  faculty?: string;
  department?: string;
  entryYear: number;
  entryMonth: number;
  entryType: EducationEntryType;
  exitYear?: number;
  exitMonth?: number;
  exitType?: EducationExitType;
}

// ─── 職歴エントリ ─────────────────────────────────────────────────────────────
export interface WorkEntry {
  id: string;
  company: string;
  department?: string;
  position?: string;
  description?: string;
  entryYear: number;
  entryMonth: number;
  exitYear?: number;
  exitMonth?: number;
  isCurrent: boolean;
}

// ─── 資格・免許エントリ ───────────────────────────────────────────────────────
export interface LicenseEntry {
  id: string;
  year: number;
  month: number;
  name: string;
  category: "license" | "qualification";
}

// ─── 履歴書集約ルート ─────────────────────────────────────────────────────────
export interface Resume {
  id: string;
  userId?: string;
  format: ResumeFormat;
  title: string;
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  workHistory: WorkEntry[];
  licenses: LicenseEntry[];
  motivation: string;
  selfPR: string;
  hobbies: string;
  commute?: string;
  dependents?: number;
  spouseDependent?: boolean;
  desiredSalary?: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

// ─── 部分更新用ユーティリティ型 ───────────────────────────────────────────────
export type ResumeUpdate = Partial<Omit<Resume, "id" | "createdAt" | "updatedAt">>;
export type PersonalInfoUpdate = Partial<PersonalInfo>;
