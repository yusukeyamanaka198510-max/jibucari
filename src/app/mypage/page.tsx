import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { SupabaseProfileRepository } from "@/infrastructure/supabase/profileRepository";
import { MypageClient } from "./MypageClient";

export const metadata: Metadata = {
  title: "マイページ | ジブキャリ",
  description: "登録情報の確認・編集ができます。",
};

export const dynamic = "force-dynamic";

export default async function MypagePage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage");

  const repo = new SupabaseProfileRepository(supabase);
  let profile = null;
  try {
    profile = await repo.get(user.id);
  } catch {
    // プロフィール未作成の場合はnullのまま
  }

  return (
    <MypageClient
      userId={user.id}
      userEmail={user.email ?? ""}
      initialProfile={profile}
    />
  );
}
