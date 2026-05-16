import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { SkillSheet, TechSkill, ProjectEntry } from "@/types/skillSheet";
import { createSkillSheet, createTechSkill, createProjectEntry } from "@/domain/entities/skillSheet";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface SkillSheetState {
  current: SkillSheet | null;
  saved: SkillSheet[];
  autoSaveStatus: AutoSaveStatus;
}

interface SkillSheetActions {
  initNew: () => void;
  loadSkillSheet: (ss: SkillSheet) => void;
  updateField: (patch: Partial<SkillSheet>) => void;
  addSkill: () => void;
  updateSkill: (id: string, patch: Partial<TechSkill>) => void;
  removeSkill: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;
  saveCurrentToList: () => void;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
  deleteSaved: (id: string) => void;
}

export const useSkillSheetStore = create<SkillSheetState & SkillSheetActions>()(
  devtools(
    persist(
      immer((set) => ({
        current: null,
        saved: [],
        autoSaveStatus: "idle" as AutoSaveStatus,

        initNew: () => set((s) => { s.current = createSkillSheet(); }),

        loadSkillSheet: (ss) => set((s) => { s.current = ss; }),

        updateField: (patch) =>
          set((s) => {
            if (!s.current) return;
            Object.assign(s.current, patch);
            s.current.updatedAt = new Date().toISOString();
          }),

        addSkill: () =>
          set((s) => { s.current?.skills.push(createTechSkill()); }),

        updateSkill: (id, patch) =>
          set((s) => {
            const e = s.current?.skills.find((sk) => sk.id === id);
            if (e) Object.assign(e, patch);
          }),

        removeSkill: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.skills = s.current.skills.filter((e) => e.id !== id);
          }),

        addProject: () =>
          set((s) => { s.current?.projects.push(createProjectEntry()); }),

        updateProject: (id, patch) =>
          set((s) => {
            const e = s.current?.projects.find((p) => p.id === id);
            if (e) Object.assign(e, patch);
          }),

        removeProject: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.projects = s.current.projects.filter((e) => e.id !== id);
          }),

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
        name: "skill-sheet-store",
        partialize: (state) => ({ current: state.current, saved: state.saved }),
      }
    ),
    { name: "SkillSheetStore" }
  )
);
