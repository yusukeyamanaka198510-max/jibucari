import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CoverLetter, EnclosureItem } from "@/types/coverLetter";
import { createCoverLetter, createEnclosureItem } from "@/domain/entities/coverLetter";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface CoverLetterState {
  current: CoverLetter | null;
  saved: CoverLetter[];
  autoSaveStatus: AutoSaveStatus;
}

interface CoverLetterActions {
  initNew: () => void;
  loadCoverLetter: (cl: CoverLetter) => void;
  updateField: (patch: Partial<CoverLetter>) => void;
  addEnclosure: () => void;
  updateEnclosure: (id: string, patch: Partial<EnclosureItem>) => void;
  removeEnclosure: (id: string) => void;
  saveCurrentToList: () => void;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
  deleteSaved: (id: string) => void;
}

export const useCoverLetterStore = create<CoverLetterState & CoverLetterActions>()(
  devtools(
    persist(
      immer((set) => ({
        current: null,
        saved: [],
        autoSaveStatus: "idle" as AutoSaveStatus,

        initNew: () => set((s) => { s.current = createCoverLetter(); }),

        loadCoverLetter: (cl) => set((s) => { s.current = cl; }),

        updateField: (patch) =>
          set((s) => {
            if (!s.current) return;
            Object.assign(s.current, patch);
            s.current.updatedAt = new Date().toISOString();
          }),

        addEnclosure: () =>
          set((s) => { s.current?.enclosures.push(createEnclosureItem()); }),

        updateEnclosure: (id, patch) =>
          set((s) => {
            const e = s.current?.enclosures.find((enc) => enc.id === id);
            if (e) Object.assign(e, patch);
          }),

        removeEnclosure: (id) =>
          set((s) => {
            if (!s.current) return;
            s.current.enclosures = s.current.enclosures.filter((e) => e.id !== id);
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
        name: "cover-letter-store",
        partialize: (state) => ({ current: state.current, saved: state.saved }),
      }
    ),
    { name: "CoverLetterStore" }
  )
);
