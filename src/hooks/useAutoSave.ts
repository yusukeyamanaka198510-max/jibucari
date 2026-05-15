import { useEffect, useRef } from "react";
import { useResumeStore } from "@/store/resumeStore";

const DEBOUNCE_MS = 1500;

/**
 * currentが変化するたびにデバウンスして自動保存するフック。
 * バックエンド保存が実装されたら `onSave` に差し替えるだけで対応できる。
 */
export function useAutoSave(onSave?: (id: string) => Promise<void>) {
  const current = useResumeStore((s) => s.current);
  const saveCurrentToList = useResumeStore((s) => s.saveCurrentToList);
  const setAutoSaveStatus = useResumeStore((s) => s.setAutoSaveStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        saveCurrentToList();
        if (onSave) await onSave(current.id);
        setAutoSaveStatus("saved");
      } catch {
        setAutoSaveStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, saveCurrentToList, setAutoSaveStatus, onSave]);
}
