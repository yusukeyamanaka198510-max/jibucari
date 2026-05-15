import type { Metadata } from "next";
import { ResumeFormLayout } from "@/components/templates/ResumeFormLayout";

export const metadata: Metadata = {
  title: "履歴書を作成 | ヤギ履歴書",
};

/**
 * 新規履歴書作成ページ。
 * フォームロジックは ResumeFormLayout テンプレートに委譲する。
 */
export default function NewResumePage() {
  return <ResumeFormLayout format="jis" />;
}
