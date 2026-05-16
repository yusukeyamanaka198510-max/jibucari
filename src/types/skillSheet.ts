// ─── スキルシート ─────────────────────────────────────────────────────────────

export type TechLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type TechCategory =
  | "language"
  | "framework"
  | "database"
  | "cloud"
  | "tool"
  | "other";

export interface TechSkill {
  id: string;
  name: string;
  category: TechCategory;
  years: number;
  level: TechLevel;
}

export interface ProjectEntry {
  id: string;
  name: string;
  client?: string;
  startYear: number;
  startMonth: number;
  endYear?: number;
  endMonth?: number;
  isCurrent: boolean;
  role: string;
  scale?: string;
  description: string;
  techStack: string;
}

export interface SkillSheet {
  id: string;
  userId?: string;
  title: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  nearestStation?: string;
  email: string;
  summary: string;
  skills: TechSkill[];
  projects: ProjectEntry[];
  selfPR: string;
  createdAt: string;
  updatedAt: string;
}
