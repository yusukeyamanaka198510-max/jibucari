import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { UserSearchFilters } from "@/types/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * クエリパラメータ:
 *   q, educationLevel, jobHuntStatus, prefecture, gender,
 *   ageMin, ageMax, tag, actionType,
 *   registeredFrom, registeredTo,
 *   sortBy, sortDir, page, perPage
 */
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const sp = req.nextUrl.searchParams;

  const filters: UserSearchFilters = {
    q:             sp.get("q")             ?? undefined,
    educationLevel: (sp.get("educationLevel") ?? undefined) as UserSearchFilters["educationLevel"],
    jobHuntStatus:  (sp.get("jobHuntStatus")  ?? undefined) as UserSearchFilters["jobHuntStatus"],
    prefecture:    sp.get("prefecture")    ?? undefined,
    gender:        sp.get("gender")        ?? undefined,
    ageMin:        sp.get("ageMin")        ? Number(sp.get("ageMin"))  : undefined,
    ageMax:        sp.get("ageMax")        ? Number(sp.get("ageMax"))  : undefined,
    tag:           sp.get("tag")           ?? undefined,
    actionType:    (sp.get("actionType")   ?? undefined) as UserSearchFilters["actionType"],
    registeredFrom: sp.get("registeredFrom") ?? undefined,
    registeredTo:   sp.get("registeredTo")   ?? undefined,
    sortBy:        (sp.get("sortBy") ?? "created_at") as UserSearchFilters["sortBy"],
    sortDir:       (sp.get("sortDir") ?? "desc")      as UserSearchFilters["sortDir"],
    page:          sp.get("page")    ? Number(sp.get("page"))    : 1,
    perPage:       sp.get("perPage") ? Number(sp.get("perPage")) : 20,
  };

  try {
    // Supabase RPC で PostgreSQL 関数を呼び出す
    const { data, error } = await admin.rpc("admin_search_users", {
      p_query:      filters.q          ?? null,
      p_education:  filters.educationLevel ?? null,
      p_job_status: filters.jobHuntStatus  ?? null,
      p_prefecture: filters.prefecture ?? null,
      p_gender:     filters.gender     ?? null,
      p_age_min:    filters.ageMin     ?? null,
      p_age_max:    filters.ageMax     ?? null,
      p_tag:        filters.tag        ?? null,
      p_action_type: filters.actionType ?? null,
      p_reg_from:   filters.registeredFrom ?? null,
      p_reg_to:     filters.registeredTo   ?? null,
      p_sort_by:    filters.sortBy     ?? "created_at",
      p_sort_dir:   filters.sortDir    ?? "desc",
      p_page:       filters.page       ?? 1,
      p_per_page:   filters.perPage    ?? 20,
    });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
