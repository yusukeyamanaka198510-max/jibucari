"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { FileText } from "lucide-react";

const schema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

type FormValues = z.infer<typeof schema>;

interface AuthFormProps {
  mode: "login" | "register";
}

/**
 * ログイン / 新規登録を切り替えて使える認証フォーム Organism。
 * `mode` props で表示内容を変更し、コードの重複を排除する。
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const { signIn, signUp, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (values: FormValues) => {
    clearError();
    try {
      if (mode === "login") {
        await signIn(values.email, values.password);
        router.push(nextPath);
      } else {
        await signUp(values.email, values.password);
        setSuccessMessage(
          "確認メールを送信しました。メール内のリンクからアカウントを有効化してください。"
        );
      }
    } catch {
      // エラーは authStore の error に格納済み
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* ブランドロゴ */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent tracking-tight">
            ジブキャリ
          </span>
        </div>
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "メールアドレスとパスワードでログイン"
            : "無料で登録して履歴書を管理"}
        </p>
      </div>

      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <FormField
            id="email"
            label="メールアドレス"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              hasError={!!errors.email}
              {...register("email")}
            />
          </FormField>

          <FormField
            id="password"
            label="パスワード"
            required
            error={errors.password?.message}
            hint={mode === "register" ? "8文字以上で設定してください" : undefined}
          >
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              hasError={!!errors.password}
              {...register("password")}
            />
          </FormField>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {mode === "login" ? "ログイン" : "アカウントを作成"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            アカウントをお持ちでない方は{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              新規登録
            </Link>
          </>
        ) : (
          <>
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              ログイン
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
