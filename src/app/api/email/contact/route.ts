import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { name, email, category, message } = (await req.json()) as {
      name: string;
      email: string;
      category: string;
      message: string;
    };

    const transporter = createTransport();

    await transporter.sendMail({
      from: `"ジブキャリ" <${process.env.GMAIL_USER}>`,
      to: "yusukeyamanaka198510@gmail.com",
      replyTo: email || undefined,
      subject: `【ジブキャリ】お問い合わせ — ${name || email}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#222">
          <h2 style="color:#4338CA">お問い合わせが届きました</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold;width:160px">お名前</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${name || "未入力"}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">メールアドレス</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${email}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">お問い合わせ種類</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${category || "未選択"}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">内容</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0;white-space:pre-wrap">${message}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("contact error:", e);
    return NextResponse.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }
}
