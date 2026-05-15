import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useResumeStore } from "@/store/resumeStore";

// zustand の persist ミドルウェアをスキップするためストアをリセット
beforeEach(() => {
  act(() => {
    useResumeStore.setState({
      current: null,
      saved: [],
      autoSaveStatus: "idle",
    });
  });
});

describe("useResumeStore", () => {
  describe("initNew", () => {
    it("新規履歴書を current にセットする", () => {
      act(() => useResumeStore.getState().initNew("jis"));
      const { current } = useResumeStore.getState();
      expect(current).not.toBeNull();
      expect(current?.format).toBe("jis");
      expect(current?.education).toHaveLength(0);
    });
  });

  describe("updatePersonalInfo", () => {
    it("基本情報を部分更新できる", () => {
      act(() => {
        useResumeStore.getState().initNew();
        useResumeStore.getState().updatePersonalInfo({ lastName: "田中" });
      });
      expect(useResumeStore.getState().current?.personalInfo.lastName).toBe("田中");
    });
  });

  describe("addEducation / removeEducation", () => {
    it("学歴を追加・削除できる", () => {
      act(() => {
        useResumeStore.getState().initNew();
        useResumeStore.getState().addEducation();
        useResumeStore.getState().addEducation();
      });
      expect(useResumeStore.getState().current?.education).toHaveLength(2);

      const id = useResumeStore.getState().current!.education[0]!.id;
      act(() => useResumeStore.getState().removeEducation(id));
      expect(useResumeStore.getState().current?.education).toHaveLength(1);
    });

    it("存在しないIDを削除しても他のエントリに影響しない", () => {
      act(() => {
        useResumeStore.getState().initNew();
        useResumeStore.getState().addEducation();
        useResumeStore.getState().removeEducation("non-existent-id");
      });
      expect(useResumeStore.getState().current?.education).toHaveLength(1);
    });
  });

  describe("saveCurrentToList", () => {
    it("初回保存で saved に追加される", () => {
      act(() => {
        useResumeStore.getState().initNew();
        useResumeStore.getState().saveCurrentToList();
      });
      expect(useResumeStore.getState().saved).toHaveLength(1);
    });

    it("同一IDを再保存した場合は上書きになる", () => {
      act(() => {
        useResumeStore.getState().initNew();
        useResumeStore.getState().saveCurrentToList();
        useResumeStore.getState().updatePersonalInfo({ lastName: "更新後" });
        useResumeStore.getState().saveCurrentToList();
      });
      const { saved } = useResumeStore.getState();
      expect(saved).toHaveLength(1);
      expect(saved[0]?.personalInfo.lastName).toBe("更新後");
    });
  });

  describe("setMotivation / setSelfPR / setHobbies", () => {
    it("テキストフィールドを更新できる", () => {
      act(() => {
        useResumeStore.getState().initNew();
        useResumeStore.getState().setMotivation("御社を志望した理由は...");
        useResumeStore.getState().setSelfPR("私の強みは...");
        useResumeStore.getState().setHobbies("読書");
      });
      const { current } = useResumeStore.getState();
      expect(current?.motivation).toBe("御社を志望した理由は...");
      expect(current?.selfPR).toBe("私の強みは...");
      expect(current?.hobbies).toBe("読書");
    });
  });
});
