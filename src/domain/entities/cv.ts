import type { CV, CvWorkEntry, CvSkillEntry } from "@/types/cv";

const uid = () => crypto.randomUUID();

export function createCV(): CV {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "職務経歴書",
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    birthDate: "",
    address: "",
    mobilePhone: "",
    email: "",
    summary: "",
    workHistory: [],
    skills: [],
    selfPR: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function createCvWorkEntry(): CvWorkEntry {
  return {
    id: uid(),
    company: "",
    industry: "",
    scale: "",
    department: "",
    position: "",
    entryYear: new Date().getFullYear() - 1,
    entryMonth: 4,
    exitYear: undefined,
    exitMonth: undefined,
    isCurrent: true,
    description: "",
    achievements: "",
  };
}

export function createCvSkillEntry(): CvSkillEntry {
  return {
    id: uid(),
    category: "",
    items: "",
  };
}
