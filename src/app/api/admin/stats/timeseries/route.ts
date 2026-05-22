import { NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
  cumulative: number;
}

export interface TimeSeriesResponse {
  data: TimeSeriesDataPoint[];
  metric: string;
  granularity: string;
}

type Metric = "users" | "resumes" | "pdf_download" | "pdf_email" | "interview_request";
type Granularity = "daily" | "monthly";

function isMetric(v: string | null): v is Metric {
  return v === "users" || v === "resumes" || v === "pdf_download" || v === "pdf_email" || v === "interview_request";
}

function isGranularity(v: string | null): v is Granularity {
  return v === "daily" || v === "monthly";
}

/** Fill gaps in the date range with count=0 */
function fillDailyGaps(
  rows: { date: string; count: number }[],
  days: number
): { date: string; count: number }[] {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const result: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

function fillMonthlyGaps(
  rows: { date: string; count: number }[]
): { date: string; count: number }[] {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const result: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

function addCumulative(rows: { date: string; count: number }[]): TimeSeriesDataPoint[] {
  let cumulative = 0;
  return rows.map((r) => {
    cumulative += r.count;
    return { date: r.date, count: r.count, cumulative };
  });
}

export async function GET(request: Request) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { searchParams } = new URL(request.url);
  const metric = searchParams.get("metric");
  const granularity = searchParams.get("granularity") ?? "daily";
  const daysParam = searchParams.get("days");

  if (!isMetric(metric)) {
    return NextResponse.json(
      { error: "Invalid metric. Must be one of: users, resumes, pdf_download, pdf_email, interview_request" },
      { status: 400 }
    );
  }
  if (!isGranularity(granularity)) {
    return NextResponse.json(
      { error: "Invalid granularity. Must be daily or monthly" },
      { status: 400 }
    );
  }

  const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 365) : 30;

  try {
    let rawRows: { date: string; count: number }[] = [];

    if (granularity === "daily") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString();

      if (metric === "users") {
        const { data, error } = await admin
          .from("profiles")
          .select("created_at")
          .gte("created_at", cutoffStr);

        if (error) throw error;

        const map = new Map<string, number>();
        for (const row of data ?? []) {
          const date = (row.created_at as string).slice(0, 10);
          map.set(date, (map.get(date) ?? 0) + 1);
        }
        rawRows = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
      } else if (metric === "resumes") {
        const { data, error } = await admin
          .from("resumes")
          .select("created_at")
          .gte("created_at", cutoffStr);

        if (error) throw error;

        const map = new Map<string, number>();
        for (const row of data ?? []) {
          const date = (row.created_at as string).slice(0, 10);
          map.set(date, (map.get(date) ?? 0) + 1);
        }
        rawRows = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
      } else {
        const { data, error } = await admin
          .from("action_logs")
          .select("created_at")
          .eq("action_type", metric)
          .gte("created_at", cutoffStr);

        if (error) throw error;

        const map = new Map<string, number>();
        for (const row of data ?? []) {
          const date = (row.created_at as string).slice(0, 10);
          map.set(date, (map.get(date) ?? 0) + 1);
        }
        rawRows = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
      }

      const filled = fillDailyGaps(rawRows, days);
      const withCumulative = addCumulative(filled);
      return NextResponse.json({ data: withCumulative, metric, granularity } satisfies TimeSeriesResponse);
    } else {
      // monthly: last 12 months
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      const cutoffStr = cutoff.toISOString();

      if (metric === "users") {
        const { data, error } = await admin
          .from("profiles")
          .select("created_at")
          .gte("created_at", cutoffStr);

        if (error) throw error;

        const map = new Map<string, number>();
        for (const row of data ?? []) {
          const yearMonth = (row.created_at as string).slice(0, 7);
          map.set(yearMonth, (map.get(yearMonth) ?? 0) + 1);
        }
        rawRows = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
      } else if (metric === "resumes") {
        const { data, error } = await admin
          .from("resumes")
          .select("created_at")
          .gte("created_at", cutoffStr);

        if (error) throw error;

        const map = new Map<string, number>();
        for (const row of data ?? []) {
          const yearMonth = (row.created_at as string).slice(0, 7);
          map.set(yearMonth, (map.get(yearMonth) ?? 0) + 1);
        }
        rawRows = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
      } else {
        const { data, error } = await admin
          .from("action_logs")
          .select("created_at")
          .eq("action_type", metric)
          .gte("created_at", cutoffStr);

        if (error) throw error;

        const map = new Map<string, number>();
        for (const row of data ?? []) {
          const yearMonth = (row.created_at as string).slice(0, 7);
          map.set(yearMonth, (map.get(yearMonth) ?? 0) + 1);
        }
        rawRows = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
      }

      const filled = fillMonthlyGaps(rawRows);
      const withCumulative = addCumulative(filled);
      return NextResponse.json({ data: withCumulative, metric, granularity } satisfies TimeSeriesResponse);
    }
  } catch (err) {
    console.error("[admin/stats/timeseries]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
