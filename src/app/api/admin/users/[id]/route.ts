import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";
import type { AdminUserProfile, ActionLogRow, ContactLogRow, UserTagRow } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { id } = params;

  try {
    // プロフィール
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (profileErr) throw profileErr;
    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 並列取得
    const [
      { data: resumes },
      { data: actions },
      { data: contactLogs },
      { data: tags },
    ] = await Promise.all([
      admin.from("resumes")
        .select("id, title, format, created_at, updated_at")
        .eq("user_id", id)
        .order("updated_at", { ascending: false }),

      admin.from("action_logs")
        .select("id, user_id, action_type, target_id, metadata, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),

      admin.from("contact_logs")
        .select("id, user_id, admin_id, contact_type, subject, body, sent_at, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),

      admin.from("user_tags")
        .select("id, user_id, tag, created_at")
        .eq("user_id", id),
    ]);

    // page_sessions は存在しない場合もあるため安全に取得
    let pageSessions: unknown[] = [];
    try {
      const { data: sessionsData } = await admin
        .from("page_sessions")
        .select("id, page_url, entered_at, exited_at, duration_seconds, form_abandoned")
        .eq("user_id", id)
        .order("entered_at", { ascending: false })
        .limit(20);
      pageSessions = sessionsData ?? [];
    } catch {
      // テーブルが存在しない場合は空配列のまま
    }

    // アクション集計
    const allActions = actions ?? [];
    const actionCount = allActions.length;
    const pdfDownloadCount = allActions.filter((a) => (a.action_type as string) === "pdf_download").length;
    const pdfEmailCount    = allActions.filter((a) => (a.action_type as string) === "pdf_email").length;
    const interviewCount   = allActions.filter((a) => (a.action_type as string) === "interview_request").length;

    // プロフィールを camelCase にマッピング
    const p = profile as Record<string, unknown>;
    const mappedProfile: AdminUserProfile = {
      id:              p["id"] as string,
      email:           p["email"] as string,
      lastName:        (p["last_name"] as string) ?? "",
      firstName:       (p["first_name"] as string) ?? "",
      lastNameKana:    (p["last_name_kana"] as string) ?? "",
      firstNameKana:   (p["first_name_kana"] as string) ?? "",
      birthDate:       (p["birth_date"] as string) ?? "",
      gender:          (p["gender"] as string) ?? "",
      prefecture:      (p["prefecture"] as string) ?? "",
      educationLevel:  (p["education_level"] as AdminUserProfile["educationLevel"]) ?? null,
      universityName:  (p["university_name"] as string) ?? null,
      jobHuntStatus:   (p["job_hunt_status"] as AdminUserProfile["jobHuntStatus"]) ?? null,
      desiredIndustry: (p["desired_industry"] as string[]) ?? null,
      lastActiveAt:    (p["last_active_at"] as string) ?? null,
      createdAt:       p["created_at"] as string,
      resumeCount:     (resumes ?? []).length,
      actionCount,
      pdfDownloadCount,
      pdfEmailCount,
      interviewCount,
      tags:            (tags ?? []).map((t: { tag: string }) => t.tag),
    };

    // actionLogs を camelCase にマッピング
    const actionLogs: ActionLogRow[] = allActions.map((a) => ({
      id:         a["id"] as string,
      userId:     a["user_id"] as string,
      actionType: a["action_type"] as ActionLogRow["actionType"],
      targetId:   (a["target_id"] as string) ?? null,
      metadata:   (a["metadata"] as Record<string, unknown>) ?? {},
      createdAt:  a["created_at"] as string,
    }));

    // contactLogs を camelCase にマッピング
    const mappedContactLogs: ContactLogRow[] = (contactLogs ?? []).map((c) => ({
      id:          c["id"] as string,
      userId:      c["user_id"] as string,
      adminId:     (c["admin_id"] as string) ?? null,
      contactType: c["contact_type"] as ContactLogRow["contactType"],
      subject:     (c["subject"] as string) ?? null,
      body:        c["body"] as string,
      sentAt:      (c["sent_at"] as string) ?? null,
      createdAt:   c["created_at"] as string,
    }));

    // userTags を camelCase にマッピング
    const userTags: UserTagRow[] = (tags ?? []).map((t) => ({
      id:        t["id"] as string,
      userId:    t["user_id"] as string,
      tag:       t["tag"] as string,
      createdAt: t["created_at"] as string,
    }));

    // resumes を camelCase にマッピング
    const mappedResumes = (resumes ?? []).map((r) => ({
      id:        r["id"] as string,
      title:     (r["title"] as string) ?? "",
      format:    (r["format"] as string) ?? "",
      createdAt: r["created_at"] as string,
      updatedAt: r["updated_at"] as string,
    }));

    return NextResponse.json({
      data: {
        profile:     mappedProfile,
        resumes:     mappedResumes,
        actionLogs,
        contactLogs: mappedContactLogs,
        userTags,
        pageSessions,
      },
    });
  } catch (err) {
    console.error("[admin/users/[id] GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
