// ─── 職務経歴書 ───────────────────────────────────────────────────────────────

export interface CvWorkEntry {
  id: string;
  company: string;
  industry?: string;
  scale?: string;
  department?: string;
  position?: string;
  entryYear: number;
  entryMonth: number;
  exitYear?: number;
  exitMonth?: number;
  isCurrent: boolean;
  description: string;
  achievements?: string;
}

export interface CvSkillEntry {
  id: string;
  category: string;
  items: string;
}

export interface CV {
  id: string;
  userId?: string;
  title: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  address: string;
  mobilePhone: string;
  email: string;
  summary: string;
  workHistory: CvWorkEntry[];
  skills: CvSkillEntry[];
  selfPR: string;
  createdAt: string;
  updatedAt: string;
}
