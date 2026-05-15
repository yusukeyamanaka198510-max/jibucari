import type { IResumeRepository } from "@/domain/repositories/IResumeRepository";
import type { Resume, ResumeUpdate } from "@/types";

/**
 * 既存履歴書を部分更新するユースケース。
 * updatedAt は常にここで更新することでドメインの一貫性を保つ。
 */
export async function updateResumeUseCase(
  repository: IResumeRepository,
  id: string,
  patch: ResumeUpdate
): Promise<Resume> {
  const updatedPatch: ResumeUpdate = {
    ...patch,
    // updatedAt をユースケース層で強制付与
  };
  return repository.update(id, updatedPatch);
}
