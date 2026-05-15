import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Resume,
  PersonalInfo,
  EducationEntry,
  WorkEntry,
  LicenseEntry,
  ResumeFormat,
} from "@/types";
import {
  createResume,
  createEducationEntry,
  createEducationFromBirthDate,
  createWorkEntry,
  createLicenseEntry,
} from "@/domain/entities/resume";

interface ResumeState {
  current: Resume | null;
  saved: Resume[];
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
}

interface ResumeActions {
  initNew: (format?: ResumeFormat) => void;
  loadResume: (resume: Resume) => void;
  updatePersonalInfo: (patch: Partial<PersonalInfo>) => void;

  addEducation: (overrides?: Partial<EducationEntry>) => void;
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  initEducationFromBirthDate: (birthDate: string) => void;

  addWork: () => void;
  updateWork: (id: string, patch: Partial<WorkEntry>) => void;
  removeWork: (id: string) => void;

  addLicense: (category?: LicenseEntry["category"], name?: string) => void;
  updateLicense: (id: string, patch: Partial<LicenseEntry>) => void;
  removeLicense: (id: string) => void;

  setMotivation: (value: string) => void;
  setSelfPR: (value: string) => void;
  setHobbies: (value: string) => void;

  saveCurrentToList: () => void;
  setAutoSaveStatus: (status: ResumeState["autoSaveStatus"]) => void;
  deleteSaved: (id: string) => void;
}

type ResumeStore = ResumeState & ResumeActions;

export const useResumeStore = create<ResumeStore>()(
  devtools(
    persist(
      immer((set) => ({
        current: null,
        saved: [],
        autoSaveStatus: "idle",

        initNew: (format = "jis") =>
          set((s) => {
            const resume = createResume(format);
            resume.education.push(createEducationEntry());
            s.current = resume;
          }),

        loadResume: (resume) =>
          set((s) => { s.current = resume; }),

        updatePersonalInfo: (patch) =>
          set((s) => {
            if (!s.current) return;
            Object.assign(s.current.personalInfo, patch);
            s.current.updatedAt = new Date().toISOString();
          }),

        addEducation: (overrides) =>
          set((s) => {
            s.current?.education.push(createEducationEntry(overrides));
          }),

        updateEducation: (id, patch) =>
          set((s) => {
            const entry = s.current?.education.find((e) => e.id === id);
            if (entry) Object.assign(entry, patch);
          }),

        removeEducation: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.education = s.current.education.filter((e) => e.id !== id);
          }),

        initEducationFromBirthDate: (birthDate) =>
          set((s) => {
            if (!s.current) return;
            const PLACEHOLDERS = ["○○小学校", "○○中学校", "○○高等学校"];
            const canAutoFill = s.current.education.every(
              (e) => !e.school || PLACEHOLDERS.includes(e.school)
            );
            if (!canAutoFill) return;
            s.current.education = createEducationFromBirthDate(birthDate);
          }),

        addWork: () =>
          set((s) => { s.current?.workHistory.push(createWorkEntry()); }),

        updateWork: (id, patch) =>
          set((s) => {
            const entry = s.current?.workHistory.find((e) => e.id === id);
            if (entry) Object.assign(entry, patch);
          }),

        removeWork: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.workHistory = s.current.workHistory.filter((e) => e.id !== id);
          }),

        addLicense: (category = "license", name = "") =>
          set((s) => { s.current?.licenses.push(createLicenseEntry(category, name)); }),

        updateLicense: (id, patch) =>
          set((s) => {
            const entry = s.current?.licenses.find((e) => e.id === id);
            if (entry) Object.assign(entry, patch);
          }),

        removeLicense: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.licenses = s.current.licenses.filter((e) => e.id !== id);
          }),

        setMotivation: (value) =>
          set((s) => { if (s.current) s.current.motivation = value; }),

        setSelfPR: (value) =>
          set((s) => { if (s.current) s.current.selfPR = value; }),

        setHobbies: (value) =>
          set((s) => { if (s.current) s.current.hobbies = value; }),

        saveCurrentToList: () =>
          set((s) => {
            if (!s.current) return;
            const idx = s.saved.findIndex((r) => r.id === s.current!.id);
            if (idx >= 0) s.saved[idx] = s.current;
            else s.saved.push(s.current);
          }),

        setAutoSaveStatus: (status) =>
          set((s) => { s.autoSaveStatus = status; }),

        deleteSaved: (id) =>
          set((s) => {
            s.saved = s.saved.filter((r) => r.id !== id);
            if (s.current?.id === id) s.current = null;
          }),
      })),
      {
        name: "resume-platform-store",
        partialize: (state) => ({ current: state.current, saved: state.saved }),
      }
    ),
    { name: "ResumeStore" }
  )
);
