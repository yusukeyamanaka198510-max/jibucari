import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageResumeRepository } from "@/infrastructure/repositories/localStorageResumeRepository";
import { createResume } from "@/domain/entities/resume";

const repo = new LocalStorageResumeRepository();

beforeEach(() => localStorage.clear());

describe("LocalStorageResumeRepository", () => {
  it("save / findById で保存・取得できる", async () => {
    const resume = createResume("jis", "テスト");
    await repo.save(resume);
    const found = await repo.findById(resume.id);
    expect(found?.id).toBe(resume.id);
    expect(found?.title).toBe("テスト");
  });

  it("findAll でページネーション動作する", async () => {
    await Promise.all([
      repo.save(createResume()),
      repo.save(createResume()),
      repo.save(createResume()),
    ]);
    const result = await repo.findAll(undefined, 1, 2);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
  });

  it("update で部分更新される", async () => {
    const resume = createResume();
    await repo.save(resume);
    const updated = await repo.update(resume.id, { title: "更新済み" });
    expect(updated.title).toBe("更新済み");
    expect(updated.id).toBe(resume.id);
  });

  it("存在しないIDを update するとエラー", async () => {
    await expect(repo.update("no-such-id", {})).rejects.toThrow();
  });

  it("delete で削除される", async () => {
    const resume = createResume();
    await repo.save(resume);
    await repo.delete(resume.id);
    expect(await repo.findById(resume.id)).toBeNull();
  });
});
