import type { Metadata } from "next";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = { title: "管理パネル | ジブキャリ" };

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
