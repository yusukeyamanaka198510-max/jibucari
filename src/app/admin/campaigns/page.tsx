import type { Metadata } from "next";
import { CampaignsClient } from "./CampaignsClient";

export const metadata: Metadata = { title: "キャンペーン | ジブキャリ管理" };

export default function CampaignsPage() {
  return <CampaignsClient />;
}
