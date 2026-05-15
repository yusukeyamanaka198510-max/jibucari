import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "ジブキャリ <onboarding@resend.dev>";

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

    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
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
          content: pdfBase64,
          contentType: "application/pdf",
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("send-resume error:", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
