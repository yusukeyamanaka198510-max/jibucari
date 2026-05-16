import type { Metadata } from "next";
import { SkillSheetFormLayout } from "@/components/templates/SkillSheetFormLayout";

export const metadata: Metadata = {
  title: "スキルシートを作成 | ジブキャリ",
  description: "スキルシートをかんたん作成。技術スキル・プロジェクト経歴をPDFで即ダウンロード。",
};

export default function SkillSheetNewPage() {
  return <SkillSheetFormLayout />;
}
