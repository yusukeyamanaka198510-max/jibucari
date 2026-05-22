import { NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/** アクセス数の推移（種別内訳）レスポンス */
export interface AccessBreakdownPoint {
  date: string;
  pdf_download: number;
  pdf_email: number;
  interview_request: number;
  resume_created: number;
  resume_updated: number;
  total: number;
}

/** 学歴別トレンドのレスポンス */
export interface EducationTrendPoint {
  date: string;
  byEducation: Record<string, number>;
  total: number;
}

type ChartMetric = "access_breakdown" | "education_trend";
type Granularity = "daily" | "monthly";

const ACTION_TYPES = [
  "pdf_download",
  "pdf_email",
  "interview_request",
  "resume_created",
  "resume_updated",
] as const;

function fillDailyKeys(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function fillMonthlyKeys(): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return result;
}

export async function GET(request: Request) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { searchParams } = new URL(request.url);
  const metric = searchParams.get("metric") as ChartMetric | null;
  const granularity = (searchParams.get("granularity") ?? "daily") as Granularity;
  const daysParam = searchParams.get("days");
  const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 90) : 30;

  if (metric !== "access_breakdown" && metric !== "education_trend") {
    return NextResponse.json(
      { error: "Invalid metric. Must be access_breakdown or education_trend" },
      { status: 400 }
    );
  }
  if (granularity !== "daily" && granularity !== "monthly") {
    return NextResponse.json({ error: "Invalid granularity" }, { status: 400 });
  }

  const cutoff = new Date();
  if (granularity === "daily") {
    cutoff.setDate(cutoff.getDate() - days);
  } else {
    cutoff.setFullYear(cutoff.getFullYear() - 1);
  }
  const cutoffStr = cutoff.toISOString();

  try {
    // ── アクセス数の推移（種別内訳） ──────────────────────────────
    if (metric === "access_breakdown") {
      const { data, error } = await admin
        .from("action_logs")
        .select("action_type, created_at")
        .gte("created_at", cutoffStr);

      if (error) throw error;

      const dateKey = (iso: string) =>
        granularity === "daily" ? iso.slice(0, 10) : iso.slice(0, 7);

      // period -> action_type -> count
      const map = new Map<string, Record<string, number>>();

      for (const row of data ?? []) {
        const key = dateKey(row.created_at as string);
        if (!map.has(key)) map.set(key, {});
        const entry = map.get(key)!;
        const at = row.action_type as string;
        entry[at] = (entry[at] ?? 0) + 1;
      }

      const keys = granularity === "daily" ? fillDailyKeys(days) : fillMonthlyKeys();

      const result: AccessBreakdownPoint[] = keys.map((k) => {
        const entry = map.get(k) ?? {};
        const pdf_download       = entry["pdf_download"]       ?? 0;
        const pdf_email          = entry["pdf_email"]          ?? 0;
        const interview_request  = entry["interview_request"]  ?? 0;
        const resume_created     = entry["resume_created"]     ?? 0;
        const resume_updated     = entry["resume_updated"]     ?? 0;
        const total = pdf_download + pdf_email + interview_request + resume_created + resume_updated;
        return { date: k, pdf_download, pdf_email, interview_request, resume_created, resume_updated, total };
      });

      return NextResponse.json({ data: result, metric, granularity });
    }

    // ── 学歴別トレンド ────────────────────────────────────────────
    const { data, error } = await admin
      .from("profiles")
      .select("education_level, created_at")
      .gte("created_at", cutoffStr);

    if (error) throw error;

    const dateKey = (iso: string) =>
      granularity === "daily" ? iso.slice(0, 10) : iso.slice(0, 7);

    // period -> education_level -> count
    const map = new Map<string, Record<string, number>>();
    const educationSet = new Set<string>();

    for (const row of data ?? []) {
      const key = dateKey(row.created_at as string);
      const edu = (row.education_level as string | null) ?? "不明";
      educationSet.add(edu);
      if (!map.has(key)) map.set(key, {});
      const entry = map.get(key)!;
      entry[edu] = (entry[edu] ?? 0) + 1;
    }

    const keys = granularity === "daily" ? fillDailyKeys(days) : fillMonthlyKeys();
    const edus = Array.from(educationSet);

    const result: EducationTrendPoint[] = keys.map((k) => {
      const entry = map.get(k) ?? {};
      const byEducation: Record<string, number> = {};
      for (const edu of edus) {
        byEducation[edu] = entry[edu] ?? 0;
      }
      const total = Object.values(byEducation).reduce((a, b) => a + b, 0);
      return { date: k, byEducation, total };
    });

    return NextResponse.json({ data: result, metric, granularity, educationKeys: edus });
  } catch (err) {
    console.error("[admin/stats/breakdown]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// action_types エクスポート（フロントエンドで使用）
export { ACTION_TYPES };
