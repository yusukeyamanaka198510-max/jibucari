import type { IResumeRepository } from "@/domain/repositories/IResumeRepository";
import type { Resume, ResumeUpdate, PaginatedResult } from "@/types";

const STORAGE_KEY = "resume_platform_resumes";

/**
 * ローカルストレージを使ったリポジトリ実装。
 * サーバーサイドでは呼び出されないため、window チェックは省略している。
 */
export class LocalStorageResumeRepository implements IResumeRepository {
  private readAll(): Resume[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Resume[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(resumes: Resume[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  }

  async findById(id: string): Promise<Resume | null> {
    return this.readAll().find((r) => r.id === id) ?? null;
  }

  async findAll(
    userId?: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResult<Resume>> {
    let items = this.readAll();
    if (userId) items = items.filter((r) => r.userId === userId);
    const total = items.length;
    const sliced = items.slice((page - 1) * perPage, page * perPage);
    return { items: sliced, total, page, perPage };
  }

  async save(resume: Resume): Promise<Resume> {
    const all = this.readAll();
    this.writeAll([...all, resume]);
    return resume;
  }

  async update(id: string, patch: ResumeUpdate): Promise<Resume> {
    const all = this.readAll();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Resume not found: ${id}`);
    const updated: Resume = {
      ...(all[index] as Resume),
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    this.writeAll(all);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((r) => r.id !== id));
  }
}
