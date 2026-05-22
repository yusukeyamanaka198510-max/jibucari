import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient, adminUnavailable } from "@/lib/adminClient";

export const dynamic = "force-dynamic";

/** POST /api/admin/users/[id]/tags  body: { tag: string } */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const { tag } = (await req.json()) as { tag: string };
  if (!tag?.trim()) return NextResponse.json({ error: "tag is required" }, { status: 400 });

  const { data, error } = await admin
    .from("user_tags")
    .upsert({ user_id: params.id, tag: tag.trim() }, { onConflict: "user_id,tag" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

/** DELETE /api/admin/users/[id]/tags?tag=xxx */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  if (!admin) return adminUnavailable();

  const tag = req.nextUrl.searchParams.get("tag");
  if (!tag) return NextResponse.json({ error: "tag is required" }, { status: 400 });

  const { error } = await admin
    .from("user_tags")
    .delete()
    .eq("user_id", params.id)
    .eq("tag", tag);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
