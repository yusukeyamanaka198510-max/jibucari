import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAgeCalculator } from "@/hooks/useAgeCalculator";

// calculateAge の単体テストは domain 層でカバー済みのため、
// フックが正しく値を返すかの統合確認に絞る

describe("useAgeCalculator", () => {
  it("有効な生年月日を渡すと age > 0 を返す", () => {
    const { result } = renderHook(() => useAgeCalculator("1990-01-01"));
    expect(result.current.age).toBeGreaterThan(0);
  });

  it("空文字列を渡すと age = 0 を返す", () => {
    const { result } = renderHook(() => useAgeCalculator(""));
    expect(result.current.age).toBe(0);
  });

  it("schoolEntranceYear が birthDate に連動して計算される", () => {
    const { result } = renderHook(() => useAgeCalculator("2000-04-01"));
    // 2000年4月1日生まれ → 小学校入学2006年
    expect(result.current.schoolEntranceYear).toBe(2006);
  });
});
