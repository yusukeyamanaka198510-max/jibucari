import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { AdminUserProfile, UserSearchFilters } from "@/types/admin";
import { getUniversityRank } from "@/lib/universityRankings";

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

  const sortByParam = sp.get("sortBy") ?? "createdAt";
  const sortDirParam = (sp.get("sortDir") ?? "desc") as "asc" | "desc";
  const page = sp.get("page") ? Number(sp.get("page")) : 1;
  const perPage = sp.get("perPage") ? Number(sp.get("perPage")) : 20;

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
    sortBy:        "created_at",
    sortDir:       "desc",
    page:          1,
    perPage:       20,
  };

  try {
    if (sortByParam === "hensachi") {
      // Fetch all matching users (DB doesn't know about hensachi sort)
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
        p_sort_by:    "created_at",
        p_sort_dir:   "desc",
        p_page:       1,
        p_per_page:   9999,
      });

      if (error) throw error;

      const allUsers = (data as { data: AdminUserProfile[] }).data ?? [];

      // Sort by university rank; nulls always at end
      const sorted = [...allUsers].sort((a, b) => {
        const ra = getUniversityRank(a.universityName);
        const rb = getUniversityRank(b.universityName);
        if (ra === null && rb === null) return 0;
        if (ra === null) return 1;
        if (rb === null) return -1;
        return sortDirParam === "asc" ? ra - rb : rb - ra;
      });

      const total = sorted.length;
      const slice = sorted.slice((page - 1) * perPage, page * perPage);

      return NextResponse.json({
        data: slice,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      });
    }

    // Non-hensachi sort: pass through to DB
    const dbSortBy = sortByParam === "createdAt" ? "created_at"
      : sortByParam === "lastActiveAt" ? "last_active_at"
      : "created_at";

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
      p_sort_by:    dbSortBy,
      p_sort_dir:   sortDirParam,
      p_page:       page,
      p_per_page:   perPage,
    });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
