import type { Metadata } from "next";
import { ResumeFormLayout } from "@/components/templates/ResumeFormLayout";

export const metadata: Metadata = {
  title: "履歴書を編集 | ヤギ履歴書",
};

interface Props {
  params: { id: string };
}

/**
 * 既存履歴書の編集ページ。
 * IDをテンプレートに渡してストアから復元する。
 */
export default function EditResumePage({ params }: Props) {
  return <ResumeFormLayout resumeId={params.id} />;
}
