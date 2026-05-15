import type { IResumeRepository } from "@/domain/repositories/IResumeRepository";
import { createResume } from "@/domain/entities/resume";
import type { Resume, ResumeFormat } from "@/types";

interface CreateResumeInput {
  format: ResumeFormat;
  title?: string;
  userId?: string;
}

/**
 * 新規履歴書を作成して永続化するユースケース。
 * ドメインエンティティの生成とリポジトリへの委譲のみを担う。
 */
export async function createResumeUseCase(
  repository: IResumeRepository,
  input: CreateResumeInput
): Promise<Resume> {
  const resume = createResume(input.format, input.title);
  if (input.userId) {
    resume.userId = input.userId;
  }
  return repository.save(resume);
}
