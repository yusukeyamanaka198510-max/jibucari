import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CV, CvWorkEntry, CvSkillEntry } from "@/types/cv";
import { createCV, createCvWorkEntry, createCvSkillEntry } from "@/domain/entities/cv";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface CvState {
  current: CV | null;
  saved: CV[];
  autoSaveStatus: AutoSaveStatus;
}

interface CvActions {
  initNew: () => void;
  loadCV: (cv: CV) => void;
  updateField: (patch: Partial<CV>) => void;
  addWork: () => void;
  updateWork: (id: string, patch: Partial<CvWorkEntry>) => void;
  removeWork: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, patch: Partial<CvSkillEntry>) => void;
  removeSkill: (id: string) => void;
  saveCurrentToList: () => void;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
  deleteSaved: (id: string) => void;
}

export const useCvStore = create<CvState & CvActions>()(
  devtools(
    persist(
      immer((set) => ({
        current: null,
        saved: [],
        autoSaveStatus: "idle" as AutoSaveStatus,

        initNew: () => set((s) => { s.current = createCV(); }),

        loadCV: (cv) => set((s) => { s.current = cv; }),

        updateField: (patch) =>
          set((s) => {
            if (!s.current) return;
            Object.assign(s.current, patch);
            s.current.updatedAt = new Date().toISOString();
          }),

        addWork: () =>
          set((s) => { s.current?.workHistory.push(createCvWorkEntry()); }),

        updateWork: (id, patch) =>
          set((s) => {
            const e = s.current?.workHistory.find((w) => w.id === id);
            if (e) Object.assign(e, patch);
          }),

        removeWork: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.workHistory = s.current.workHistory.filter((e) => e.id !== id);
          }),

        addSkill: () =>
          set((s) => { s.current?.skills.push(createCvSkillEntry()); }),

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
        name: "cv-store",
        partialize: (state) => ({ current: state.current, saved: state.saved }),
      }
    ),
    { name: "CvStore" }
  )
);
