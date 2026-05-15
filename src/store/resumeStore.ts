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
  createWorkEntry,
  createLicenseEntry,
} from "@/domain/entities/resume";

// ─── State 型 ─────────────────────────────────────────────────────────────────
interface ResumeState {
  /** 現在編集中の履歴書 */
  current: Resume | null;
  /** 保存済み履歴書の一覧 */
  saved: Resume[];
  /** 自動保存の処理状態 */
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
}

// ─── Action 型 ────────────────────────────────────────────────────────────────
interface ResumeActions {
  // 初期化・選択
  initNew: (format?: ResumeFormat) => void;
  loadResume: (resume: Resume) => void;

  // 基本情報
  updatePersonalInfo: (patch: Partial<PersonalInfo>) => void;

  // 学歴
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;

  // 職歴
  addWork: () => void;
  updateWork: (id: string, patch: Partial<WorkEntry>) => void;
  removeWork: (id: string) => void;

  // 資格・免許
  addLicense: () => void;
  updateLicense: (id: string, patch: Partial<LicenseEntry>) => void;
  removeLicense: (id: string) => void;

  // テキストフィールド
  setMotivation: (value: string) => void;
  setSelfPR: (value: string) => void;
  setHobbies: (value: string) => void;

  // 保存操作
  saveCurrentToList: () => void;
  setAutoSaveStatus: (status: ResumeState["autoSaveStatus"]) => void;
  deleteSaved: (id: string) => void;
}

type ResumeStore = ResumeState & ResumeActions;

// ─── Store 本体 ───────────────────────────────────────────────────────────────
export const useResumeStore = create<ResumeStore>()(
  devtools(
    persist(
      immer((set) => ({
        // ── Initial state ──
        current: null,
        saved: [],
        autoSaveStatus: "idle",

        // ── Actions ──
        initNew: (format = "jis") =>
          set((s) => {
            s.current = createResume(format);
          }),

        loadResume: (resume) =>
          set((s) => {
            s.current = resume;
          }),

        updatePersonalInfo: (patch) =>
          set((s) => {
            if (!s.current) return;
            Object.assign(s.current.personalInfo, patch);
            s.current.updatedAt = new Date().toISOString();
          }),

        addEducation: () =>
          set((s) => {
            s.current?.education.push(createEducationEntry());
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

        addWork: () =>
          set((s) => {
            s.current?.workHistory.push(createWorkEntry());
          }),

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

        addLicense: () =>
          set((s) => {
            s.current?.licenses.push(createLicenseEntry());
          }),

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
          set((s) => {
            if (s.current) s.current.motivation = value;
          }),

        setSelfPR: (value) =>
          set((s) => {
            if (s.current) s.current.selfPR = value;
          }),

        setHobbies: (value) =>
          set((s) => {
            if (s.current) s.current.hobbies = value;
          }),

        saveCurrentToList: () =>
          set((s) => {
            if (!s.current) return;
            const idx = s.saved.findIndex((r) => r.id === s.current!.id);
            if (idx >= 0) {
              s.saved[idx] = s.current;
            } else {
              s.saved.push(s.current);
            }
          }),

        setAutoSaveStatus: (status) =>
          set((s) => {
            s.autoSaveStatus = status;
          }),

        deleteSaved: (id) =>
          set((s) => {
            s.saved = s.saved.filter((r) => r.id !== id);
            if (s.current?.id === id) s.current = null;
          }),
      })),
      {
        name: "resume-platform-store",
        // current だけはセッション間で復元し、savedはローカルに保持
        partialize: (state) => ({ current: state.current, saved: state.saved }),
      }
    ),
    { name: "ResumeStore" }
  )
);
