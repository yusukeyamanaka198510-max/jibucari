import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

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
      { data: sessions },
    ] = await Promise.all([
      admin.from("resumes")
        .select("id, title, format, created_at, updated_at")
        .eq("user_id", id)
        .order("updated_at", { ascending: false }),

      admin.from("action_logs")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),

      admin.from("contact_logs")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),

      admin.from("user_tags")
        .select("tag")
        .eq("user_id", id),

      admin.from("page_sessions")
        .select("id, page, started_at, ended_at, duration_sec, exit_field, is_completed")
        .eq("user_id", id)
        .order("started_at", { ascending: false })
        .limit(20),
    ]);

    return NextResponse.json({
      data: {
        profile: {
          ...profile,
          tags: (tags ?? []).map((t: { tag: string }) => t.tag),
        },
        resumes: resumes ?? [],
        actions: (actions ?? []).map((a: Record<string, unknown>) => ({
          id:         a.id,
          actionType: a.action_type,
          targetId:   a.target_id,
          metadata:   a.metadata,
          createdAt:  a.created_at,
        })),
        contactLogs: (contactLogs ?? []).map((c: Record<string, unknown>) => ({
          id:          c.id,
          adminId:     c.admin_id,
          contactType: c.contact_type,
          subject:     c.subject,
          body:        c.body,
          sentAt:      c.sent_at,
          createdAt:   c.created_at,
        })),
        sessions: sessions ?? [],
      },
    });
  } catch (err) {
    console.error("[admin/users/[id] GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
