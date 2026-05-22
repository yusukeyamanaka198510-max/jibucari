import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/**
 * POST /api/track/session
 * Body: { userId?, pageUrl, referrer?, deviceType?, userAgent? }
 * Returns: { sessionId }
 *
 * PUT /api/track/session
 * Body: { sessionId, exitUrl?, durationSeconds?, maxScrollDepth?, formAbandoned? }
 */

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Tracking unavailable" }, { status: 503 });

  try {
    const body = await req.json() as {
      userId?: string;
      pageUrl: string;
      referrer?: string;
      deviceType?: string;
      userAgent?: string;
    };

    if (!body.pageUrl) {
      return NextResponse.json({ error: "pageUrl is required" }, { status: 400 });
    }

    const { data, error } = await admin
      .from("page_sessions")
      .insert({
        user_id:     body.userId ?? null,
        page_url:    body.pageUrl,
        referrer:    body.referrer ?? null,
        device_type: body.deviceType ?? null,
        user_agent:  body.userAgent ?? null,
        entered_at:  new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ sessionId: (data as { id: string }).id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Tracking unavailable" }, { status: 503 });

  try {
    const body = await req.json() as {
      sessionId: string;
      exitUrl?: string;
      durationSeconds?: number;
      maxScrollDepth?: number;
      formAbandoned?: boolean;
    };

    if (!body.sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      exited_at: new Date().toISOString(),
    };
    if (body.exitUrl          !== undefined) updates.exit_url          = body.exitUrl;
    if (body.durationSeconds  !== undefined) updates.duration_seconds  = body.durationSeconds;
    if (body.maxScrollDepth   !== undefined) updates.max_scroll_depth  = body.maxScrollDepth;
    if (body.formAbandoned    !== undefined) updates.form_abandoned    = body.formAbandoned;

    const { error } = await admin
      .from("page_sessions")
      .update(updates)
      .eq("id", body.sessionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
