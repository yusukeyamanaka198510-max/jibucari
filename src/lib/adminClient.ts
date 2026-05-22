import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * サーバーサイド専用の管理者 Supabase クライアント。
 * Service Role Key を使用して RLS をバイパスする。
 * API Route からのみ使用すること（Client Component では絶対に使わない）。
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  if (url.includes("dummy") || url.includes("placeholder")) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** 管理クライアントが利用できない場合の標準レスポンス */
export function adminUnavailable() {
  return Response.json(
    { error: "Admin client unavailable. Set SUPABASE_SERVICE_ROLE_KEY." },
    { status: 503 }
  );
}
