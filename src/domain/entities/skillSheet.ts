import type { SkillSheet, TechSkill, ProjectEntry } from "@/types/skillSheet";

const uid = () => crypto.randomUUID();

export function createSkillSheet(): SkillSheet {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "スキルシート",
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    birthDate: "",
    nearestStation: "",
    email: "",
    summary: "",
    skills: [],
    projects: [],
    selfPR: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function createTechSkill(): TechSkill {
  return {
    id: uid(),
    name: "",
    category: "language",
    years: 1,
    level: "intermediate",
  };
}

export function createProjectEntry(): ProjectEntry {
  return {
    id: uid(),
    name: "",
    client: "",
    startYear: new Date().getFullYear() - 1,
    startMonth: 4,
    endYear: undefined,
    endMonth: undefined,
    isCurrent: true,
    role: "",
    scale: "",
    description: "",
    techStack: "",
  };
}
