import { NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * 詳細なアクセス・行動分析データを返す。
 *
 * 返すデータ:
 * - pageViews: ページ別の閲覧数
 * - ctaClicks: CTAボタン別の押下回数
 * - resumeFunnel: 履歴書作成ファネル（各段階の人数）
 * - registerWithResume: 履歴書作成完了 → 会員登録した数
 * - interviewRequests: 面談リクエスト数（内、希望日時あり）
 * - actionBreakdown: アクション種別の全件集計
 * - recentInterviews: 最近の面談リクエスト一覧（希望日時含む）
 */
export async function GET() {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  try {
    // 全アクションログを取得（集計用）
    const { data: allLogs, error: logsErr } = await admin
      .from("action_logs")
      .select("id, user_id, action_type, target_id, metadata, created_at")
      .order("created_at", { ascending: false });

    if (logsErr) throw logsErr;

    const logs = (allLogs ?? []) as {
      id: string;
      user_id: string;
      action_type: string;
      target_id: string | null;
      metadata: Record<string, unknown> | null;
      created_at: string;
    }[];

    // 1. アクション種別の全件集計
    const actionBreakdown: Record<string, number> = {};
    for (const log of logs) {
      actionBreakdown[log.action_type] = (actionBreakdown[log.action_type] ?? 0) + 1;
    }

    // 2. ページ別閲覧数（action_type = 'page_view' の metadata.page か target_id を使用）
    const pageViewCounts: Record<string, number> = {};
    for (const log of logs) {
      if (log.action_type === "page_view") {
        const page =
          (log.metadata?.["page"] as string) ??
          (log.metadata?.["path"] as string) ??
          log.target_id ??
          "unknown";
        pageViewCounts[page] = (pageViewCounts[page] ?? 0) + 1;
      }
    }
    const totalPageViews = actionBreakdown["page_view"] ?? 0;

    // 3. CTAボタン押下数
    const CTA_ACTIONS: Record<string, string> = {
      pdf_download:      "PDF書き出しボタン",
      pdf_email:         "メール転送ボタン",
      interview_request: "面談リクエストボタン",
      resume_created:    "履歴書作成開始",
      resume_updated:    "履歴書保存ボタン",
      profile_updated:   "プロフィール保存ボタン",
    };

    const ctaClicks: { label: string; action: string; count: number }[] = Object.entries(CTA_ACTIONS).map(
      ([action, label]) => ({
        action,
        label,
        count: actionBreakdown[action] ?? 0,
      })
    );

    // 4. 履歴書作成ファネル
    // ステップ1: ログインorアカウント作成（register + login）
    // ステップ2: 履歴書作成開始（resume_created）
    // ステップ3: 履歴書を保存/更新（resume_updated）
    // ステップ4: PDF書き出し（pdf_download or pdf_email）

    const usersWithRegister    = new Set(logs.filter((l) => l.action_type === "register").map((l) => l.user_id));
    const usersWithResume      = new Set(logs.filter((l) => l.action_type === "resume_created").map((l) => l.user_id));
    const usersWithResumeUpdate = new Set(logs.filter((l) => l.action_type === "resume_updated").map((l) => l.user_id));
    const usersWithPdf          = new Set(
      logs.filter((l) => l.action_type === "pdf_download" || l.action_type === "pdf_email").map((l) => l.user_id)
    );

    // 全ユーザー数を取得
    const { count: totalUsers } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const resumeFunnel = [
      { step: 1, label: "会員登録",          count: usersWithRegister.size },
      { step: 2, label: "履歴書作成",         count: usersWithResume.size },
      { step: 3, label: "履歴書を保存・更新", count: usersWithResumeUpdate.size },
      { step: 4, label: "PDF書き出し",        count: usersWithPdf.size },
    ];

    // 5. 履歴書作成完了 → 会員登録まで行った数（resume_created AND register の両方を持つユーザー）
    const registerWithResumeCount = [...usersWithRegister].filter((uid) => usersWithResume.has(uid)).length;

    // 6. 面談リクエスト数
    const interviewLogs = logs.filter((l) => l.action_type === "interview_request");
    const interviewTotal = interviewLogs.length;

    // 希望日時あり = metadata に preferred_date / date / datetime などがあるもの
    const interviewWithDatetime = interviewLogs.filter((l) => {
      if (!l.metadata) return false;
      const m = l.metadata;
      return !!(
        m["preferred_date"] ??
        m["preferredDate"] ??
        m["date"] ??
        m["datetime"] ??
        m["preferred_datetime"] ??
        m["scheduledAt"]
      );
    });

    // 最近の面談リクエスト一覧（最大20件）
    const recentInterviews = interviewLogs.slice(0, 20).map((l) => ({
      id:             l.id,
      userId:         l.user_id,
      targetId:       l.target_id,
      metadata:       l.metadata,
      createdAt:      l.created_at,
      hasDatetime: !!(
        l.metadata?.["preferred_date"] ??
        l.metadata?.["preferredDate"] ??
        l.metadata?.["date"] ??
        l.metadata?.["datetime"] ??
        l.metadata?.["preferred_datetime"] ??
        l.metadata?.["scheduledAt"]
      ),
    }));

    // ページ別閲覧数トップ20
    const topPageViews = Object.entries(pageViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([page, count]) => ({ page, count }));

    return NextResponse.json({
      data: {
        totalPageViews,
        topPageViews,
        ctaClicks,
        actionBreakdown,
        resumeFunnel,
        totalUsers:               totalUsers ?? 0,
        registerWithResumeCount,
        interviewTotal,
        interviewWithDatetimeCount: interviewWithDatetime.length,
        recentInterviews,
      },
    });
  } catch (err) {
    console.error("[admin/analytics]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
