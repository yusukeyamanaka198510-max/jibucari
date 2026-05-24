import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/bulk-email
 * 指定したユーザーID一覧にメールを一括送信する。
 * Body: { userIds: string[], subject: string, body: string }
 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  let userIds: string[];
  let subject: string;
  let body: string;

  try {
    const json = (await req.json()) as { userIds?: unknown; subject?: unknown; body?: unknown };
    if (!Array.isArray(json.userIds) || json.userIds.length === 0) {
      return NextResponse.json({ error: "userIds が必要です" }, { status: 400 });
    }
    if (typeof json.subject !== "string" || !json.subject.trim()) {
      return NextResponse.json({ error: "subject が必要です" }, { status: 400 });
    }
    if (typeof json.body !== "string" || !json.body.trim()) {
      return NextResponse.json({ error: "body が必要です" }, { status: 400 });
    }
    userIds = json.userIds as string[];
    subject = json.subject;
    body = json.body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ユーザー情報を取得
  const { data: profiles, error: profErr } = await admin
    .from("profiles")
    .select("id, email, last_name, first_name")
    .in("id", userIds);

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  const targets = (profiles ?? []) as {
    id: string;
    email: string;
    last_name: string;
    first_name: string;
  }[];

  if (targets.length === 0) {
    return NextResponse.json({ error: "送信対象が見つかりません" }, { status: 404 });
  }

  // nodemailer 設定
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const target of targets) {
    const personalizedBody = body
      .replace(/\{\{name\}\}/g, `${target.last_name}${target.first_name}`)
      .replace(/\{\{email\}\}/g, target.email);

    // プレーンテキストを HTML に変換（改行を <br> に）
    const htmlBody = personalizedBody
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    try {
      await transporter.sendMail({
        from:    process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
        to:      target.email,
        subject,
        text:    personalizedBody,
        html:    `<div style="font-family:sans-serif;line-height:1.7;">${htmlBody}</div>`,
      });
      sentCount++;
    } catch (err) {
      failedCount++;
      errors.push(`${target.email}: ${String(err)}`);
    }
  }

  // 操作ログ記録
  try {
    await admin.from("admin_operation_logs").insert({
      operation_type: "bulk_email",
      target_type:    "users",
      summary:        `一括メール送信「${subject}」(成功:${sentCount} 失敗:${failedCount})`,
    });
  } catch {
    // ログ失敗はサイレント
  }

  return NextResponse.json({
    success: true,
    sentCount,
    failedCount,
    totalRecipients: targets.length,
    errors: errors.slice(0, 10), // 最初の10件のみ返す
  });
}
