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
    const { pdfBase64, email, name } = (await req.json()) as {
      pdfBase64: string;
      email: string;
      name: string;
    };

    if (!email) {
      return NextResponse.json({ error: "メールアドレスが設定されていません" }, { status: 400 });
    }

    const transporter = createTransport();

    await transporter.sendMail({
      from: `"ジブキャリ" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "【ジブキャリ】履歴書PDFをお送りします",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#222">
          <h2 style="color:#4338CA">ジブキャリ</h2>
          <p>${name} 様</p>
          <p>ジブキャリをご利用いただきありがとうございます。<br>
          作成した履歴書PDFを添付いたします。</p>
          <p>応募先への提出にお役立てください。</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="font-size:12px;color:#888">
            このメールはジブキャリサービスより自動送信されています。
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${name}_履歴書.pdf`,
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("send-resume error:", e);
    return NextResponse.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }
}
