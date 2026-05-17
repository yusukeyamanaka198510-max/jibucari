import { NextResponse } from "next/server";
import { getAdminStats, getRecentLogs } from "@/lib/adminMockData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    stats: getAdminStats(),
    recentLogs: getRecentLogs(15),
  });
}
