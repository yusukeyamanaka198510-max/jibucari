import type { Metadata } from "next";
import { HelpClient } from "./HelpClient";

export const metadata: Metadata = {
  title: "ヘルプ・よくある質問 | ジブキャリ",
  description: "ジブキャリのよくある質問と問い合わせフォームです。",
};

export default function HelpPage() {
  return <HelpClient />;
}
