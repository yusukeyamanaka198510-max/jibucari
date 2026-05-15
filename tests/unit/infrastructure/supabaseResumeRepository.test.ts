import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseResumeRepository } from "@/infrastructure/repositories/supabaseResumeRepository";
import { createResume } from "@/domain/entities/resume";

/**
 * Supabase クライアントのモック。
 * 実際のDB接続を持たずロジックのみを検証する。
 */
function makeSupabaseMock(overrides: Record<string, unknown> = {}) {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    ...overrides,
  };
  return { from: vi.fn(() => chainable), _chain: chainable };
}

describe("SupabaseResumeRepository", () => {
  describe("findById", () => {
    it("存在しないIDは null を返す", async () => {
      const { _chain, ...supabase } = makeSupabaseMock();
      _chain.single.mockResolvedValue({ data: null, error: { message: "not found" } });
      const repo = new SupabaseResumeRepository(supabase as never);
      expect(await repo.findById("missing")).toBeNull();
    });

    it("行データをドメインエンティティに変換する", async () => {
      const resume = createResume("jis", "テスト履歴書");
      const row = {
        id: resume.id,
        user_id: null,
        format: "jis",
        title: "テスト履歴書",
        personal_info: resume.personalInfo,
        education: [],
        work_history: [],
        licenses: [],
        motivation: "",
        self_pr: "",
        hobbies: "",
        created_at: resume.createdAt,
        updated_at: resume.updatedAt,
      };
      const { _chain, ...supabase } = makeSupabaseMock();
      _chain.single.mockResolvedValue({ data: row, error: null });
      const repo = new SupabaseResumeRepository(supabase as never);
      const result = await repo.findById(resume.id);
      expect(result?.title).toBe("テスト履歴書");
      expect(result?.format).toBe("jis");
    });
  });

  describe("delete", () => {
    it("エラーがない場合は正常終了する", async () => {
      const { _chain, ...supabase } = makeSupabaseMock();
      _chain.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      const repo = new SupabaseResumeRepository(supabase as never);
      await expect(repo.delete("some-id")).resolves.toBeUndefined();
    });

    it("Supabase エラーは例外として伝播する", async () => {
      const { _chain, ...supabase } = makeSupabaseMock();
      _chain.delete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
      });
      const repo = new SupabaseResumeRepository(supabase as never);
      await expect(repo.delete("some-id")).rejects.toThrow("DB error");
    });
  });
});
