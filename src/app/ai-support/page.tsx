import type { Metadata } from "next";
import { AiSupportClient } from "./AiSupportClient";

export const metadata: Metadata = {
  title: "AIサポート | ジブキャリ",
  description: "自己PR・志望動機・職務要約をAIが自動生成します。",
};

export default function AiSupportPage() {
  return <AiSupportClient />;
}
