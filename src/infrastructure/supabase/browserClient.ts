import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Component 用 Supabase クライアント（シングルトン）。
 * `@supabase/ssr` の `createBrowserClient` は内部でキャッシュするため複数回呼び出しても安全。
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
