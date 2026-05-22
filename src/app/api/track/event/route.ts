import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/**
 * POST /api/track/event
 * Body: {
 *   sessionId?: string;
 *   userId?: string;
 *   eventType: string;        // e.g. "field_focus", "field_blur", "field_change", "click", "scroll"
 *   eventTarget?: string;     // e.g. field name or element selector
 *   metadata?: Record<string, unknown>;
 * }
 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Tracking unavailable" }, { status: 503 });

  try {
    const body = await req.json() as {
      sessionId?: string;
      userId?: string;
      eventType: string;
      eventTarget?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    const { error } = await admin
      .from("page_events")
      .insert({
        session_id:   body.sessionId ?? null,
        user_id:      body.userId ?? null,
        event_type:   body.eventType,
        event_target: body.eventTarget ?? null,
        metadata:     body.metadata ?? null,
        occurred_at:  new Date().toISOString(),
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
