import { v4 as uuidv4 } from "uuid";
import type {
  Resume,
  ResumeFormat,
  PersonalInfo,
  EducationEntry,
  WorkEntry,
  LicenseEntry,
} from "@/types";

// ─── ファクトリ関数 ───────────────────────────────────────────────────────────

/**
 * 新規履歴書エンティティを生成する。
 * IDと作成日時はここで付与することでドメイン外部に依存しない設計を維持する。
 */
export function createResume(
  format: ResumeFormat = "jis",
  title = "新しい履歴書"
): Resume {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    format,
    title,
    personalInfo: createEmptyPersonalInfo(),
    education: [],
    workHistory: [],
    licenses: [],
    motivation: "",
    selfPR: "",
    hobbies: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyPersonalInfo(): PersonalInfo {
  return {
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    birthDate: "",
    gender: "prefer_not_to_say",
    postalCode: "",
    prefecture: "",
    city: "",
    streetAddress: "",
    building: "",
    addressKana: "",
    mobilePhone: "",
    email: "",
  };
}

export function createEducationEntry(): EducationEntry {
  return {
    id: uuidv4(),
    year: new Date().getFullYear(),
    month: 4,
    school: "",
    faculty: "",
    department: "",
    status: "graduated",
  };
}

export function createWorkEntry(): WorkEntry {
  return {
    id: uuidv4(),
    year: new Date().getFullYear(),
    month: 4,
    company: "",
    department: "",
    position: "",
    description: "",
    status: "joined",
  };
}

export function createLicenseEntry(): LicenseEntry {
  return {
    id: uuidv4(),
    year: new Date().getFullYear(),
    month: 1,
    name: "",
    organization: "",
  };
}

// ─── ドメインロジック ─────────────────────────────────────────────────────────

/**
 * 生年月日から年齢を計算する。
 * @param birthDate - ISO 8601形式 (YYYY-MM-DD)
 * @param referenceDate - 基準日（省略時は今日）
 */
export function calculateAge(birthDate: string, referenceDate?: Date): number {
  if (!birthDate) return 0;
  const ref = referenceDate ?? new Date();
  const birth = new Date(birthDate);
  let age = ref.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    ref.getMonth() > birth.getMonth() ||
    (ref.getMonth() === birth.getMonth() && ref.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

/**
 * 生年月日と対象年度から、当時の学年入学年を和暦で返す。
 * 4月2日以降生まれが学年の始まりとなる日本の慣習に対応。
 */
export function getSchoolEntranceYear(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  // 4月2日より前生まれは当年4月入学、以降は翌年4月入学
  const adjustedYear =
    birth.getMonth() < 3 || (birth.getMonth() === 3 && birth.getDate() <= 1)
      ? birth.getFullYear()
      : birth.getFullYear() + 1;
  return adjustedYear + 6; // 小学校入学年
}

/**
 * 学歴を年月昇順にソートする。
 */
export function sortEducationEntries(entries: EducationEntry[]): EducationEntry[] {
  return [...entries].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );
}

/**
 * 職歴を年月昇順にソートする。
 */
export function sortWorkEntries(entries: WorkEntry[]): WorkEntry[] {
  return [...entries].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );
}
