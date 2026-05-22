import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { CreateContactLogInput } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/users/[id]/contact-logs */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { data, error } = await admin
    .from("contact_logs")
    .select("*")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** POST /api/admin/users/[id]/contact-logs */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const body = (await req.json()) as CreateContactLogInput;
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("contact_logs")
    .insert({
      user_id:      params.id,
      contact_type: body.contactType ?? "note",
      subject:      body.subject ?? null,
      body:         body.body,
      sent_at:      body.sentAt ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 操作ログ記録
  await admin.from("admin_operation_logs").insert({
    operation_type: "create",
    target_type:    "contact_log",
    target_id:      (data as { id: string }).id,
    summary:        `ユーザー ${params.id} へコンタクトを記録`,
  });

  return NextResponse.json({ data }, { status: 201 });
}

/** DELETE /api/admin/users/[id]/contact-logs?logId=xxx */
export async function DELETE(
  req: NextRequest,
  { params: _ }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const logId = req.nextUrl.searchParams.get("logId");
  if (!logId) return NextResponse.json({ error: "logId is required" }, { status: 400 });

  const { error } = await admin.from("contact_logs").delete().eq("id", logId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
