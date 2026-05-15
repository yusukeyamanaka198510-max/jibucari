import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/organisms/AuthForm";

export const metadata: Metadata = { title: "ログイン | ジブキャリ" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
