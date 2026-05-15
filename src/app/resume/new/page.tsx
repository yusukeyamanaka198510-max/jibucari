import type { Metadata } from "next";
import { TemplateSelect } from "@/components/templates/TemplateSelect";
import { ResumeFormLayout } from "@/components/templates/ResumeFormLayout";
import type { ResumeFormat } from "@/types";

export const metadata: Metadata = { title: "履歴書を作成 | ジブキャリ" };

const VALID_FORMATS: ResumeFormat[] = ["jis", "career_change", "new_graduate", "part_time", "no_photo"];

interface Props {
  searchParams: { format?: string };
}

export default function NewResumePage({ searchParams }: Props) {
  const fmt = searchParams.format as ResumeFormat | undefined;
  const format = VALID_FORMATS.includes(fmt!) ? fmt! : null;
  if (!format) return <TemplateSelect />;
  return <ResumeFormLayout format={format} />;
}
