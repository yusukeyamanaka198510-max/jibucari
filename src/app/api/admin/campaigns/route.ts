import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { CreateCampaignInput } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/campaigns */
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const page = Number(sp.get("page") ?? 1);
  const perPage = Number(sp.get("perPage") ?? 20);

  let query = admin
    .from("email_campaigns")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  });
}

/** POST /api/admin/campaigns — キャンペーン作成 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const body = (await req.json()) as CreateCampaignInput;
  if (!body.subject?.trim() || !body.bodyHtml?.trim()) {
    return NextResponse.json({ error: "subject and bodyHtml are required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("email_campaigns")
    .insert({
      campaign_type:     body.campaignType ?? "bulk",
      subject:           body.subject,
      body_html:         body.bodyHtml,
      filter_conditions: body.filterConditions ?? {},
      scheduled_at:      body.scheduledAt ?? null,
      status:            "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("admin_operation_logs").insert({
    operation_type: "create",
    target_type:    "campaign",
    target_id:      (data as { id: string }).id,
    summary:        `キャンペーン「${body.subject}」を作成`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
