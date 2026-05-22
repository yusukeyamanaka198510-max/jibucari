import type { SupabaseClient } from "@supabase/supabase-js";
import type { IResumeRepository } from "@/domain/repositories/IResumeRepository";
import type { Resume, ResumeUpdate, PaginatedResult } from "@/types";

const TABLE = "resumes";

/**
 * Supabase を永続化バックエンドとするリポジトリ実装。
 * DB カラムはスネークケース・エンティティはキャメルケースのため相互変換する。
 */
export class SupabaseResumeRepository implements IResumeRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Resume | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return this.toDomain(data);
  }

  async findAll(
    userId?: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResult<Resume>> {
    let query = this.supabase
      .from(TABLE)
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (userId) query = query.eq("user_id", userId);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      items: (data ?? []).map(this.toDomain),
      total: count ?? 0,
      page,
      perPage,
    };
  }

  /** INSERT OR UPDATE（id が存在する場合は更新、なければ新規作成） */
  async upsert(resume: Resume): Promise<Resume> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .upsert(this.toRow(resume), { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this.toDomain(data);
  }

  async save(resume: Resume): Promise<Resume> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(this.toRow(resume))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this.toDomain(data);
  }

  async update(id: string, patch: ResumeUpdate): Promise<Resume> {
    const row = this.toPartialRow({ ...patch, updatedAt: new Date().toISOString() });
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ─── マッピング ───────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): Resume {
    return {
      id: row.id,
      userId: row.user_id,
      format: row.format,
      title: row.title,
      personalInfo: row.personal_info,
      education: row.education ?? [],
      workHistory: row.work_history ?? [],
      licenses: row.licenses ?? [],
      motivation: row.motivation ?? "",
      selfPR: row.self_pr ?? "",
      hobbies: row.hobbies ?? "",
      commute: row.commute,
      dependents: row.dependents,
      spouseDependent: row.spouse_dependent,
      desiredSalary: row.desired_salary,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toRow(resume: Resume): Record<string, unknown> {
    return {
      id: resume.id,
      user_id: resume.userId,
      format: resume.format,
      title: resume.title,
      personal_info: resume.personalInfo,
      education: resume.education,
      work_history: resume.workHistory,
      licenses: resume.licenses,
      motivation: resume.motivation,
      self_pr: resume.selfPR,
      hobbies: resume.hobbies,
      commute: resume.commute,
      dependents: resume.dependents,
      spouse_dependent: resume.spouseDependent,
      desired_salary: resume.desiredSalary,
      created_at: resume.createdAt,
      updated_at: resume.updatedAt,
    };
  }

  private toPartialRow(patch: Partial<Resume> & { updatedAt?: string }): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.format !== undefined) row.format = patch.format;
    if (patch.personalInfo !== undefined) row.personal_info = patch.personalInfo;
    if (patch.education !== undefined) row.education = patch.education;
    if (patch.workHistory !== undefined) row.work_history = patch.workHistory;
    if (patch.licenses !== undefined) row.licenses = patch.licenses;
    if (patch.motivation !== undefined) row.motivation = patch.motivation;
    if (patch.selfPR !== undefined) row.self_pr = patch.selfPR;
    if (patch.hobbies !== undefined) row.hobbies = patch.hobbies;
    if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;
    return row;
  }
}
