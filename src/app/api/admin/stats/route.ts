import { NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { DashboardStats, TimeSeriesPoint, SegmentItem } from "@/types/admin";

export const dynamic = "force-dynamic";

const EDU_LABELS: Record<string, string> = {
  middle: "中卒", high: "高卒", high_dropout: "高校中退",
  uni: "大卒", uni_dropout: "大学中退",
  grad: "大学院卒", grad_dropout: "大学院中退", enrolled: "在学中",
};
const JOB_LABELS: Record<string, string> = {
  new_grad: "新卒", second_new_grad: "第二新卒", first_job: "就職", career_change: "転職",
};
const GENDER_LABELS: Record<string, string> = {
  male: "男性", female: "女性", other: "その他・無回答",
};

function toSegments(
  rows: { key: string; count: number }[],
  labels: Record<string, string>
): SegmentItem[] {
  const total = rows.reduce((s, r) => s + Number(r.count), 0);
  return rows.map((r) => ({
    key: r.key,
    label: labels[r.key] ?? r.key,
    count: Number(r.count),
    percent: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
  }));
}

function countBy(rows: Record<string, string | null>[] | null, key: string) {
  const map: Record<string, number> = {};
  for (const r of rows ?? []) {
    const v = r[key] as string;
    if (v) map[v] = (map[v] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([k, c]) => ({ key: k, count: c }))
    .sort((a, b) => b.count - a.count);
}

export async function GET() {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  try {
    // ── 概要統計 ─────────────────────────────────────────
    const [
      { count: totalUsers },
      { count: totalResumes },
      { count: totalActions },
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("resumes").select("*", { count: "exact", head: true }),
      admin.from("action_logs").select("*", { count: "exact", head: true }),
    ]);

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const { count: newUsersThisMonth } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonthStart.toISOString());

    // ── アクション内訳 ────────────────────────────────────
    const actionTypes = [
      "pdf_download", "pdf_email", "interview_request",
      "resume_created", "resume_updated", "login", "register",
    ];
    const actionCounts = await Promise.all(
      actionTypes.map((t) =>
        admin.from("action_logs")
          .select("*", { count: "exact", head: true })
          .eq("action_type", t)
          .then(({ count }) => [t, count ?? 0] as const)
      )
    );
    const actionBreakdown = Object.fromEntries(actionCounts);

    // ── セグメント ────────────────────────────────────────
    const [
      { data: eduRows },
      { data: genderRows },
      { data: jobRows },
      { data: prefRows },
    ] = await Promise.all([
      admin.from("profiles").select("education_level").not("education_level", "is", null),
      admin.from("profiles").select("gender").not("gender", "is", null).neq("gender", ""),
      admin.from("profiles").select("job_hunt_status").not("job_hunt_status", "is", null),
      admin.from("profiles").select("prefecture").not("prefecture", "is", null).neq("prefecture", ""),
    ]);

    // ── 時系列（直近12ヶ月）─────────────────────────────
    const { data: dsRows } = await admin
      .from("daily_stats")
      .select("*")
      .gte("date", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
      .order("date", { ascending: true });

    let timeSeries: TimeSeriesPoint[] = [];

    if (dsRows && dsRows.length > 0) {
      timeSeries = (dsRows as Record<string, number & string>[]).map((r) => ({
        date:              String(r.date),
        newUsers:          Number(r.new_users),
        activeUsers:       Number(r.active_users),
        pdfDownloads:      Number(r.pdf_downloads),
        pdfEmails:         Number(r.pdf_emails),
        interviewRequests: Number(r.interview_requests),
      }));
    } else {
      // daily_stats が空なら月次で action_logs から生成
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const from = d.toISOString().slice(0, 7) + "-01";
        const nextD = new Date(d);
        nextD.setMonth(nextD.getMonth() + 1);
        const to = nextD.toISOString().slice(0, 10);

        const [[, nu], [, au], [, pd], [, pe], [, ir]] = await Promise.all([
          admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", from).lt("created_at", to).then(({ count }) => ["nu", count ?? 0] as const),
          admin.from("action_logs").select("*", { count: "exact", head: true }).gte("created_at", from).lt("created_at", to).then(({ count }) => ["au", count ?? 0] as const),
          admin.from("action_logs").select("*", { count: "exact", head: true }).eq("action_type", "pdf_download").gte("created_at", from).lt("created_at", to).then(({ count }) => ["pd", count ?? 0] as const),
          admin.from("action_logs").select("*", { count: "exact", head: true }).eq("action_type", "pdf_email").gte("created_at", from).lt("created_at", to).then(({ count }) => ["pe", count ?? 0] as const),
          admin.from("action_logs").select("*", { count: "exact", head: true }).eq("action_type", "interview_request").gte("created_at", from).lt("created_at", to).then(({ count }) => ["ir", count ?? 0] as const),
        ]);

        timeSeries.push({
          date: from.slice(0, 7),
          newUsers: Number(nu), activeUsers: Number(au),
          pdfDownloads: Number(pd), pdfEmails: Number(pe),
          interviewRequests: Number(ir),
        });
      }
    }

    const stats: DashboardStats = {
      totalUsers:          totalUsers ?? 0,
      newUsersThisMonth:   newUsersThisMonth ?? 0,
      totalResumes:        totalResumes ?? 0,
      totalActions:        totalActions ?? 0,
      actionBreakdown,
      segmentByEducation:  toSegments(countBy(eduRows, "education_level"), EDU_LABELS),
      segmentByGender:     toSegments(countBy(genderRows, "gender"), GENDER_LABELS),
      segmentByJobStatus:  toSegments(countBy(jobRows, "job_hunt_status"), JOB_LABELS),
      segmentByPrefecture: toSegments(countBy(prefRows, "prefecture"), {}).slice(0, 10),
      timeSeries,
    };

    return NextResponse.json({ data: stats });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
