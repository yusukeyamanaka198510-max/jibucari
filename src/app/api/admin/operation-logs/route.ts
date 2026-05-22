import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/** GET /api/admin/operation-logs */
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const sp = req.nextUrl.searchParams;
  const targetType = sp.get("targetType");
  const page       = Number(sp.get("page") ?? 1);
  const perPage    = Number(sp.get("perPage") ?? 30);

  let query = admin
    .from("admin_operation_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (targetType) query = query.eq("target_type", targetType);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total:      count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  });
}
