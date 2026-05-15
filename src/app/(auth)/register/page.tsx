import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/organisms/AuthForm";

export const metadata: Metadata = { title: "新規登録 | ジブキャリ" };

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
