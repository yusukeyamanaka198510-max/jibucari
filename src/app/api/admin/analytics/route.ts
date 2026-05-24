import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * from/to 未指定時は直近7日間をデフォルトとする。
 * "all" を指定すると全期間を対象にする。
 */
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam   = searchParams.get("to");
  const allTime   = searchParams.get("range") === "all";

  // デフォルト: 直近7日
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 7);

  let fromDate: string;
  let toDate: string;

  if (allTime) {
    fromDate = "2020-01-01T00:00:00.000Z"; // 十分に古い日付
    toDate   = new Date(now.getTime() + 86400000).toISOString(); // 明日まで
  } else {
    fromDate = fromParam ? `${fromParam}T00:00:00.000Z` : defaultFrom.toISOString();
    toDate   = toParam   ? `${toParam}T23:59:59.999Z`   : new Date(now.getTime() + 86400000).toISOString();
  }

  try {
    // 指定期間のアクションログを取得
    const { data: allLogs, error: logsErr } = await admin
      .from("action_logs")
      .select("id, user_id, action_type, target_id, metadata, created_at")
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
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

    // 2. ページ別閲覧数
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

    // 4. 履歴書作成ファネル（期間内に各アクションを行ったユニークユーザー数）
    const usersWithRegister     = new Set(logs.filter((l) => l.action_type === "register").map((l) => l.user_id));
    const usersWithResume       = new Set(logs.filter((l) => l.action_type === "resume_created").map((l) => l.user_id));
    const usersWithResumeUpdate = new Set(logs.filter((l) => l.action_type === "resume_updated").map((l) => l.user_id));
    const usersWithPdf          = new Set(
      logs.filter((l) => l.action_type === "pdf_download" || l.action_type === "pdf_email").map((l) => l.user_id)
    );

    // 全ユーザー数（期間に関係なく累計）
    const { count: totalUsers } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const resumeFunnel = [
      { step: 1, label: "会員登録",          count: usersWithRegister.size },
      { step: 2, label: "履歴書作成",         count: usersWithResume.size },
      { step: 3, label: "履歴書を保存・更新", count: usersWithResumeUpdate.size },
      { step: 4, label: "PDF書き出し",        count: usersWithPdf.size },
    ];

    // 5. 履歴書作成完了 → 会員登録まで行った数
    const registerWithResumeCount = [...usersWithRegister].filter((uid) => usersWithResume.has(uid)).length;

    // 6. 面談リクエスト数
    const interviewLogs = logs.filter((l) => l.action_type === "interview_request");
    const interviewTotal = interviewLogs.length;

    const hasDatetime = (l: typeof logs[number]) => {
      const m = l.metadata;
      if (!m) return false;
      return !!(
        m["preferred_date"] ?? m["preferredDate"] ?? m["date"] ??
        m["datetime"] ?? m["preferred_datetime"] ?? m["scheduledAt"]
      );
    };

    const interviewWithDatetime = interviewLogs.filter(hasDatetime);

    const recentInterviews = interviewLogs.slice(0, 20).map((l) => ({
      id:          l.id,
      userId:      l.user_id,
      targetId:    l.target_id,
      metadata:    l.metadata,
      createdAt:   l.created_at,
      hasDatetime: hasDatetime(l),
    }));

    // ページ別閲覧数トップ20
    const topPageViews = Object.entries(pageViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([page, count]) => ({ page, count }));

    return NextResponse.json({
      data: {
        fromDate: allTime ? null : fromDate.slice(0, 10),
        toDate:   allTime ? null : toDate.slice(0, 10),
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
