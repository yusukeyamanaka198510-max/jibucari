import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { CreateCampaignInput } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/campaigns/[id] */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const [{ data: campaign, error }, { data: sendLogs }] = await Promise.all([
    admin.from("email_campaigns").select("*").eq("id", params.id).maybeSingle(),
    admin.from("email_send_logs").select("*").eq("campaign_id", params.id).order("created_at", { ascending: false }).limit(100),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: { campaign, sendLogs: sendLogs ?? [] } });
}

/** PATCH /api/admin/campaigns/[id] — 下書き更新 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const body = (await req.json()) as Partial<CreateCampaignInput>;
  const updates: Record<string, unknown> = {};
  if (body.subject)          updates.subject           = body.subject;
  if (body.bodyHtml)         updates.body_html         = body.bodyHtml;
  if (body.filterConditions) updates.filter_conditions = body.filterConditions;
  if (body.scheduledAt)      updates.scheduled_at      = body.scheduledAt;

  const { data, error } = await admin
    .from("email_campaigns")
    .update(updates)
    .eq("id", params.id)
    .eq("status", "draft")  // 下書きのみ編集可
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** DELETE /api/admin/campaigns/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { error } = await admin
    .from("email_campaigns")
    .delete()
    .eq("id", params.id)
    .eq("status", "draft");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
