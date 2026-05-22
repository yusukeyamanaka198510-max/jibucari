import { CampaignDetailClient } from "./CampaignDetailClient";

interface Props {
  params: { id: string };
}

export default function CampaignDetailPage({ params }: Props) {
  return <CampaignDetailClient id={params.id} />;
}
