import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/mypage"];
const AUTH_PATHS = ["/login", "/register"];

/**
 * 管理画面・管理APIは閉じておく。
 *
 * /api/admin 配下はサービスロールキーで動くため RLS が効かない。
 * 大半のルートに管理者の確認が入っておらず、氏名・メールアドレス・生年月日などを
 * 誰でも取得できる状態だったため、いったん全体を閉じる。
 *
 * ADMIN_ACCESS_TOKEN を設定した環境でだけ、同じ値の x-admin-token ヘッダで通す。
 * 未設定なら誰も通さない。
 */
const ADMIN_PATHS = ["/admin", "/api/admin"];

function isAdminPath(pathname: string) {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function adminAllowed(request: NextRequest) {
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected) return false;
  const given = request.headers.get("x-admin-token") ?? "";
  return given.length === expected.length && given === expected;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname) && !adminAllowed(request)) {
    return NextResponse.json(
      { error: "管理機能は現在停止しています" },
      { status: 403 }
    );
  }

  // Supabase の設定がない場合はそのまま通過
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("dummy") || supabaseUrl.includes("placeholder")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
