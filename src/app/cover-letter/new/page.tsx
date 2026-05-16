import type { Metadata } from "next";
import { CoverLetterFormLayout } from "@/components/templates/CoverLetterFormLayout";

export const metadata: Metadata = {
  title: "送付状・退職届を作成 | ジブキャリ",
  description: "送付状・退職届をかんたん作成。入力するだけでPDFを即ダウンロード。",
};

export default function CoverLetterNewPage() {
  return <CoverLetterFormLayout />;
}
