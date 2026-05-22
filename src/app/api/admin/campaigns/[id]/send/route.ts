import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/campaigns/[id]/send
 * キャンペーンを実際に送信する。
 * filter_conditions を元に対象ユーザーを検索し、nodemailer で送信。
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  // キャンペーン取得
  const { data: campaign, error: campErr } = await admin
    .from("email_campaigns")
    .select("*")
    .eq("id", params.id)
    .eq("status", "draft")
    .maybeSingle();

  if (campErr) return NextResponse.json({ error: campErr.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: "Campaign not found or already sent" }, { status: 404 });

  // ステータスを sending に変更
  await admin
    .from("email_campaigns")
    .update({ status: "sending" })
    .eq("id", params.id);

  try {
    // フィルター条件からユーザーを取得
    const fc = (campaign.filter_conditions ?? {}) as Record<string, unknown>;
    let query = admin.from("profiles").select("id, email, last_name, first_name");

    if (fc.educationLevel) query = query.eq("education_level", fc.educationLevel);
    if (fc.jobHuntStatus)  query = query.eq("job_hunt_status", fc.jobHuntStatus);
    if (fc.prefecture)     query = query.eq("prefecture", fc.prefecture);
    if (fc.gender)         query = query.eq("gender", fc.gender);

    const { data: recipients, error: recErr } = await query;
    if (recErr) throw recErr;

    const targets = (recipients ?? []) as { id: string; email: string; last_name: string; first_name: string }[];

    // メール送信設定
    const transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 送信ログを一括 insert（pending 状態）
    if (targets.length > 0) {
      await admin.from("email_send_logs").insert(
        targets.map((t) => ({
          campaign_id: params.id,
          user_id:     t.id,
          to_email:    t.email,
          status:      "pending",
        }))
      );
    }

    // 送信実行（失敗しても続行し、ログに記録）
    let sentCount = 0;
    let failedCount = 0;

    for (const target of targets) {
      const personalizedHtml = (campaign.body_html as string)
        .replace(/\{\{name\}\}/g, `${target.last_name}${target.first_name}`)
        .replace(/\{\{email\}\}/g, target.email);

      try {
        await transporter.sendMail({
          from:    process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
          to:      target.email,
          subject: campaign.subject as string,
          html:    personalizedHtml,
        });

        await admin
          .from("email_send_logs")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("campaign_id", params.id)
          .eq("user_id", target.id);

        sentCount++;
      } catch (sendErr) {
        await admin
          .from("email_send_logs")
          .update({ status: "failed", error_msg: String(sendErr) })
          .eq("campaign_id", params.id)
          .eq("user_id", target.id);

        failedCount++;
      }
    }

    // キャンペーン完了
    await admin
      .from("email_campaigns")
      .update({
        status:          failedCount === targets.length && targets.length > 0 ? "failed" : "sent",
        sent_at:         new Date().toISOString(),
        recipient_count: targets.length,
      })
      .eq("id", params.id);

    await admin.from("admin_operation_logs").insert({
      operation_type: "send_email",
      target_type:    "campaign",
      target_id:      params.id,
      summary:        `キャンペーン「${campaign.subject}」を送信 (成功:${sentCount} 失敗:${failedCount})`,
    });

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalRecipients: targets.length,
    });
  } catch (err) {
    await admin
      .from("email_campaigns")
      .update({ status: "failed" })
      .eq("id", params.id);

    console.error("[campaigns/send]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
