import { NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  try {
    // ── 各種データを並列取得 ──────────────────────────────────
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff30 = thirtyDaysAgo.toISOString();

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const cutoff12m = twelveMonthsAgo.toISOString();

    const [
      usersResult,
      resumesResult,
      actionLogsResult,
      recentUsersResult,
      educationResult,
    ] = await Promise.all([
      admin.from("profiles").select("id, created_at, education_level", { count: "exact" }),
      admin.from("resumes").select("id, created_at, format", { count: "exact" }),
      admin.from("action_logs").select("action_type, created_at").gte("created_at", cutoff30),
      admin.from("profiles").select("id, created_at").gte("created_at", cutoff30),
      admin.from("profiles").select("education_level").not("education_level", "is", null),
    ]);

    // 集計
    const totalUsers = usersResult.count ?? 0;
    const totalResumes = resumesResult.count ?? 0;

    const actionCounts: Record<string, number> = {};
    for (const row of actionLogsResult.data ?? []) {
      const at = row.action_type as string;
      actionCounts[at] = (actionCounts[at] ?? 0) + 1;
    }

    const newUsersLast30 = (recentUsersResult.data ?? []).length;

    const eduCounts: Record<string, number> = {};
    for (const row of educationResult.data ?? []) {
      const edu = (row.education_level as string) ?? "不明";
      eduCounts[edu] = (eduCounts[edu] ?? 0) + 1;
    }

    const { data: allUsers } = await admin
      .from("profiles")
      .select("created_at")
      .gte("created_at", cutoff12m);

    const monthlyUsers: Record<string, number> = {};
    for (const row of allUsers ?? []) {
      const ym = (row.created_at as string).slice(0, 7);
      monthlyUsers[ym] = (monthlyUsers[ym] ?? 0) + 1;
    }

    const { data: allActions } = await admin
      .from("action_logs")
      .select("action_type, created_at")
      .gte("created_at", cutoff12m);

    const monthlyActions: Record<string, Record<string, number>> = {};
    for (const row of allActions ?? []) {
      const ym = (row.created_at as string).slice(0, 7);
      const at = row.action_type as string;
      if (!monthlyActions[ym]) monthlyActions[ym] = {};
      monthlyActions[ym][at] = (monthlyActions[ym][at] ?? 0) + 1;
    }

    const formatCounts: Record<string, number> = {};
    for (const row of resumesResult.data ?? []) {
      const fmt = (row.format as string) ?? "不明";
      formatCounts[fmt] = (formatCounts[fmt] ?? 0) + 1;
    }

    // ── プロンプト構築 ────────────────────────────────────────
    const prompt = `あなたはSaaSプロダクトの成長を専門とするプロダクトアナリストです。
ジブキャリ（日本語の履歴書作成Webアプリ）の管理ダッシュボードデータを分析し、日本語で簡潔かつ実用的なレポートを作成してください。

レポートは以下の構成で出力してください：
1. **現状サマリー**（2〜3行）
2. **成長トレンド分析**（ユーザー数・アクション数の傾向）
3. **ユーザー行動インサイト**（どの機能が使われているか、どの学歴層が多いか）
4. **課題・懸念点**（数値から読み取れる問題点）
5. **改善アクション提案**（具体的な3〜5つの施策）

マークダウン形式（見出し・箇条書き）で出力してください。数値を引用しながら根拠のある分析をしてください。

## 分析データ（${now.toLocaleDateString("ja-JP")} 時点）

### 全体サマリー
- 総ユーザー数: ${totalUsers}人
- 総履歴書数: ${totalResumes}件
- 直近30日の新規ユーザー: ${newUsersLast30}人

### 直近30日のアクション内訳
- PDFダウンロード: ${actionCounts["pdf_download"] ?? 0}回
- メール転送: ${actionCounts["pdf_email"] ?? 0}回
- 面談リクエスト: ${actionCounts["interview_request"] ?? 0}回
- 履歴書作成: ${actionCounts["resume_created"] ?? 0}件
- 履歴書更新: ${actionCounts["resume_updated"] ?? 0}件

### 学歴別ユーザー分布
${Object.entries(eduCounts).map(([edu, cnt]) => `- ${edu}: ${cnt}人`).join("\n") || "- データなし"}

### 履歴書フォーマット別内訳
${Object.entries(formatCounts).map(([fmt, cnt]) => `- ${fmt}: ${cnt}件`).join("\n") || "- データなし"}

### 月別ユーザー登録推移（直近12ヶ月）
${Object.entries(monthlyUsers).sort().map(([ym, cnt]) => `- ${ym}: ${cnt}人`).join("\n") || "- データなし"}

### 月別アクション推移（直近12ヶ月）
${Object.entries(monthlyActions).sort().map(([ym, acts]) =>
  `- ${ym}: PDF=${acts["pdf_download"] ?? 0}, メール=${acts["pdf_email"] ?? 0}, 面談=${acts["interview_request"] ?? 0}, 履歴書作成=${acts["resume_created"] ?? 0}, 更新=${acts["resume_updated"] ?? 0}`
).join("\n") || "- データなし"}`;

    // ── Gemini REST API ストリーミング ────────────────────────
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:streamGenerateContent?key=${geminiKey}&alt=sse`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const geminiBody = geminiRes.body;

    const stream = new ReadableStream({
      async start(controller) {
        if (!geminiBody) {
          controller.enqueue(encoder.encode('data: {"error":"No response body"}\n\n'));
          controller.close();
          return;
        }

        const reader = geminiBody.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;
              try {
                const parsed = JSON.parse(raw) as {
                  candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                  }>;
                };
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // skip malformed chunk
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[admin/ai-analysis]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
