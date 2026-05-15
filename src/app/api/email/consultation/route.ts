import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "ジブキャリ <onboarding@resend.dev>";

const TOPIC_LABELS: Record<string, string> = {
  job_hunting: "就職活動の進め方",
  resume_review: "履歴書・職務経歴書の添削",
  interview_prep: "面接対策",
  career_change: "転職・キャリアチェンジ",
  industry_advice: "業界・職種の相談",
  other: "その他",
};

export async function POST(req: Request) {
  try {
    const { name, email, phone, date1, date2, date3, topic } = (await req.json()) as {
      name: string;
      email: string;
      phone: string;
      date1: string;
      date2: string;
      date3: string;
      topic: string;
    };

    const topicLabel = TOPIC_LABELS[topic] ?? topic;

    const { error } = await resend.emails.send({
      from: FROM,
      to: ["yusukeyamanaka198510@gmail.com"],
      replyTo: email || undefined,
      subject: `【ジブキャリ】面談依頼 — ${name} 様`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#222">
          <h2 style="color:#4338CA">面談依頼が届きました</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold;width:140px">お名前</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">メールアドレス</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${email}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">電話番号</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${phone || "未入力"}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">相談内容</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${topicLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">第一希望日</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${date1 ? new Date(date1).toLocaleString("ja-JP") : "未入力"}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">第二希望日</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${date2 ? new Date(date2).toLocaleString("ja-JP") : "未入力"}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;background:#f5f7ff;border:1px solid #e0e4f0;font-weight:bold">第三希望日</td>
              <td style="padding:10px 16px;border:1px solid #e0e4f0">${date3 ? new Date(date3).toLocaleString("ja-JP") : "未入力"}</td>
            </tr>
          </table>
        </div>
      `,
    });

    if (error) {
      console.error("Resend consultation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("consultation error:", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
