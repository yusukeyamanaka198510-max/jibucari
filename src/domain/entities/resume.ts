import { v4 as uuidv4 } from "uuid";
import type {
  Resume,
  ResumeFormat,
  PersonalInfo,
  EducationEntry,
  WorkEntry,
  LicenseEntry,
} from "@/types";

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

export function createEducationEntry(overrides?: Partial<EducationEntry>): EducationEntry {
  return {
    id: uuidv4(),
    school: "",
    faculty: "",
    department: "",
    entryYear: new Date().getFullYear(),
    entryMonth: 4,
    entryType: "enrolled",
    exitYear: undefined,
    exitMonth: undefined,
    exitType: undefined,
    ...overrides,
  };
}

/** 生年月日から小学校入学年度を返す（早生まれ考慮） */
export function getSchoolEntranceYear(birthDate: string): number {
  if (!birthDate) return new Date().getFullYear();
  const birth = new Date(birthDate);
  const y = birth.getFullYear();
  const isAfterApril2 = birth.getMonth() > 3 || (birth.getMonth() === 3 && birth.getDate() >= 2);
  const base = isAfterApril2 ? y + 1 : y;
  return base + 6;
}

/** 生年月日から小・中・高の学歴を自動生成 */
export function createEducationFromBirthDate(birthDate: string): EducationEntry[] {
  if (!birthDate) return [createEducationEntry()];
  const birth = new Date(birthDate);
  const y = birth.getFullYear();
  // 4月2日以降生まれは翌年入学（早生まれ考慮）
  const base = (birth.getMonth() > 3 || (birth.getMonth() === 3 && birth.getDate() >= 2))
    ? y + 1
    : y;
  return [
    createEducationEntry({ school: "○○小学校", entryYear: base + 6,  entryMonth: 4, entryType: "enrolled", exitYear: base + 12, exitMonth: 3, exitType: "graduated" }),
    createEducationEntry({ school: "○○中学校", entryYear: base + 12, entryMonth: 4, entryType: "enrolled", exitYear: base + 15, exitMonth: 3, exitType: "graduated" }),
    createEducationEntry({ school: "○○高等学校", entryYear: base + 15, entryMonth: 4, entryType: "enrolled", exitYear: base + 18, exitMonth: 3, exitType: "graduated" }),
  ];
}

export function createWorkEntry(): WorkEntry {
  return {
    id: uuidv4(),
    company: "",
    department: "",
    position: "",
    description: "",
    entryYear: new Date().getFullYear(),
    entryMonth: 4,
    exitYear: undefined,
    exitMonth: undefined,
    isCurrent: false,
  };
}

export function createLicenseEntry(
  category: LicenseEntry["category"] = "license",
  name = ""
): LicenseEntry {
  return {
    id: uuidv4(),
    year: new Date().getFullYear(),
    month: 1,
    name,
    category,
  };
}

export function calculateAge(birthDate: string, referenceDate?: Date): number {
  if (!birthDate) return 0;
  const ref = referenceDate ?? new Date();
  const birth = new Date(birthDate);
  let age = ref.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    ref.getMonth() > birth.getMonth() ||
    (ref.getMonth() === birth.getMonth() && ref.getDate() >= birth.getDate());
  if (!hasHadBirthday) age -= 1;
  return age;
}

export function sortEducationEntries(entries: EducationEntry[]): EducationEntry[] {
  return [...entries].sort((a, b) =>
    a.entryYear !== b.entryYear ? a.entryYear - b.entryYear : a.entryMonth - b.entryMonth
  );
}

export function sortWorkEntries(entries: WorkEntry[]): WorkEntry[] {
  return [...entries].sort((a, b) =>
    a.entryYear !== b.entryYear ? a.entryYear - b.entryYear : a.entryMonth - b.entryMonth
  );
}
