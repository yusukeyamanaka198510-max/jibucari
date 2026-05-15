import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { SupabaseResumeRepository } from "@/infrastructure/repositories/supabaseResumeRepository";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = { title: "ダッシュボード | ジブキャリ" };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const repo = new SupabaseResumeRepository(supabase);
  const { items: resumes } = await repo.findAll(user.id, 1, 50);

  return <DashboardClient initialResumes={resumes} userEmail={user.email ?? ""} />;
}
