import { describe, it, expect } from "vitest";
import {
  createResume,
  createEducationEntry,
  createWorkEntry,
  calculateAge,
  getSchoolEntranceYear,
  sortEducationEntries,
  sortWorkEntries,
} from "@/domain/entities/resume";

describe("createResume", () => {
  it("デフォルトフォーマット jis で初期化される", () => {
    const resume = createResume();
    expect(resume.format).toBe("jis");
    expect(resume.education).toHaveLength(0);
    expect(resume.workHistory).toHaveLength(0);
  });

  it("指定したフォーマットで作成できる", () => {
    const resume = createResume("new_graduate", "新卒用");
    expect(resume.format).toBe("new_graduate");
    expect(resume.title).toBe("新卒用");
  });

  it("一意の ID が付与される", () => {
    const a = createResume();
    const b = createResume();
    expect(a.id).not.toBe(b.id);
  });
});

describe("calculateAge", () => {
  it("誕生日前の場合は年齢から1を引く", () => {
    const age = calculateAge("2000-12-31", new Date("2024-06-01"));
    expect(age).toBe(23);
  });

  it("誕生日当日は年齢が加算される", () => {
    const age = calculateAge("2000-06-01", new Date("2024-06-01"));
    expect(age).toBe(24);
  });

  it("空文字列を渡すと 0 を返す", () => {
    expect(calculateAge("")).toBe(0);
  });
});

describe("getSchoolEntranceYear", () => {
  it("4月2日以降生まれは翌年度入学", () => {
    // 2000年4月2日生まれ → 2007年小学校入学
    expect(getSchoolEntranceYear("2000-04-02")).toBe(2007);
  });

  it("4月1日生まれは同年度入学", () => {
    // 2000年4月1日生まれ → 2006年小学校入学
    expect(getSchoolEntranceYear("2000-04-01")).toBe(2006);
  });
});

describe("sortEducationEntries", () => {
  it("年月昇順にソートされる", () => {
    const entries = [
      { ...createEducationEntry(), year: 2020, month: 4 },
      { ...createEducationEntry(), year: 2015, month: 9 },
      { ...createEducationEntry(), year: 2020, month: 1 },
    ];
    const sorted = sortEducationEntries(entries);
    expect(sorted[0]!.year).toBe(2015);
    expect(sorted[1]!.month).toBe(1);
    expect(sorted[2]!.month).toBe(4);
  });

  it("元の配列を変更しない（immutable）", () => {
    const original = [createEducationEntry(), createEducationEntry()];
    const ids = original.map((e) => e.id);
    sortEducationEntries(original);
    expect(original.map((e) => e.id)).toEqual(ids);
  });
});

describe("sortWorkEntries", () => {
  it("年月昇順にソートされる", () => {
    const entries = [
      { ...createWorkEntry(), year: 2023, month: 3 },
      { ...createWorkEntry(), year: 2018, month: 4 },
    ];
    const sorted = sortWorkEntries(entries);
    expect(sorted[0]!.year).toBe(2018);
  });
});
