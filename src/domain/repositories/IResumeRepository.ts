import type { Resume, ResumeUpdate, PaginatedResult } from "@/types";

/**
 * 履歴書永続化の抽象インターフェース。
 * インフラ層（LocalStorage / Supabase）が実装し、
 * アプリケーション層はこのインターフェースにのみ依存する。
 */
export interface IResumeRepository {
  /** IDで1件取得 */
  findById(id: string): Promise<Resume | null>;

  /** ユーザーの全履歴書をページネーションで取得 */
  findAll(userId?: string, page?: number, perPage?: number): Promise<PaginatedResult<Resume>>;

  /** 新規保存 */
  save(resume: Resume): Promise<Resume>;

  /** 部分更新 */
  update(id: string, patch: ResumeUpdate): Promise<Resume>;

  /** 削除 */
  delete(id: string): Promise<void>;
}
