import type { Metadata } from "next";
import { CvFormLayout } from "@/components/templates/CvFormLayout";

export const metadata: Metadata = {
  title: "職務経歴書を作成 | ジブキャリ",
  description: "職務経歴書をかんたん作成。入力するだけでPDFを即ダウンロード。",
};

export default function CvNewPage() {
  return <CvFormLayout />;
}
