import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const { data: article } = await supabase
    .from("articles")
    .select("view_count")
    .eq("slug", slug)
    .single();

  if (article) {
    await supabase
      .from("articles")
      .update({ view_count: (article.view_count ?? 0) + 1 })
      .eq("slug", slug);
  }

  return NextResponse.json({ ok: true });
}
