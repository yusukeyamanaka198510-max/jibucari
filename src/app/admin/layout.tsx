import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { AdminSidebar } from "./AdminSidebar";

export const metadata: Metadata = { title: "管理パネル | ジブキャリ" };

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // 管理者メールアドレスチェック（ADMIN_EMAILS 未設定時は全ユーザーを許可）
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : [];
    if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? "")) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="pl-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
