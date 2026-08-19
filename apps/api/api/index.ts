// Vercel Serverless Function向けエントリポイント。
// 2026-08-18指示: apps/apiのhttp-server.ts（node:http、永続.listen()サーバー）はVercelの
// サーバーレス実行モデルと非互換のため、同じComposition Root（composition.ts/dispatch.ts）を
// 再利用する薄いAdapterとしてこのファイルを新設する。Business Logicはここに一切書かない
// （http-server.tsと同じ「パース・レスポンス書き込みだけ」の役割）。
//
// vercel.jsonのrewritesにより、どのpathで来たリクエストも実際にはこの関数が処理する
// （クライアント側は"/api"プレフィックスなしで既存のroute pathをそのまま呼べる）。
//
// deps（DB接続プール含む）はモジュールスコープで一度だけ構築し、lambdaのウォームスタート間で
// 再利用する（コールドスタートごとに新規接続プールを作らない）。

import { Pool } from "pg";
import { createPostgresApiDeps } from "../src/composition";
import { handleApiRequest } from "../src/dispatch";
import type { ApiRequest, ApiDeps } from "../src/types";
import type { ConnectionProvider, TransactionalClient } from "@emi-compass/database";

interface VercelLikeRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelLikeResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(chunk?: string): void;
}

function wrapPgPool(pool: Pool): ConnectionProvider {
  return {
    query: (text, params) => pool.query(text, params as unknown[]) as never,
    connect: async (): Promise<TransactionalClient> => {
      const client = await pool.connect();
      return {
        query: (text, params) => client.query(text, params as unknown[]) as never,
        release: () => client.release(),
      };
    },
  };
}

function readGoogleCalendarConfig(env: NodeJS.ProcessEnv) {
  const clientId = env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return undefined;
  return { clientId, clientSecret, redirectUri };
}

function readEmiAcademyConfig(env: NodeJS.ProcessEnv) {
  const baseUrl = env.EMI_ACADEMY_BASE_URL;
  const apiKey = env.EMI_ACADEMY_API_KEY;
  if (!baseUrl || !apiKey) return undefined;
  return { baseUrl, apiKey };
}

let cachedDeps: ApiDeps | undefined;

function getDeps(): ApiDeps {
  if (cachedDeps) return cachedDeps;

  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!databaseUrl || !supabaseUrl) {
    throw new Error(
      "Missing required environment variable(s): DATABASE_URL, SUPABASE_URL. Refusing to start.",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = wrapPgPool(pool);
  const googleCalendar = readGoogleCalendarConfig(process.env);
  const emiAcademy = readEmiAcademyConfig(process.env);

  cachedDeps = createPostgresApiDeps({
    db,
    supabaseProjectUrl: supabaseUrl,
    devTrustActorHeader: false, // 本番経路では絶対にtrueにしない
    ...(googleCalendar !== undefined ? { googleCalendar } : {}),
    ...(emiAcademy !== undefined ? { emiAcademy } : {}),
  });
  return cachedDeps;
}

// MASTER SPEC §56/Q: http-server.tsと同じOrigin反射方式（Cookie未使用のため実質的なリスクは
// 変わらない、という既存の判断を踏襲する）。
function applyCorsHeaders(req: VercelLikeRequest, res: VercelLikeResponse): void {
  const origin = req.headers.origin;
  if (typeof origin === "string") {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-actor-id");
}

function toApiRequest(req: VercelLikeRequest): ApiRequest {
  const url = new URL(req.url ?? "/", "http://localhost");
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    query[key] = value;
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers[key] = value;
  }

  return {
    method: (req.method ?? "GET").toUpperCase(),
    path: url.pathname,
    params: {},
    query,
    headers,
    body: req.body,
  };
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse): Promise<void> {
  applyCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const deps = getDeps();
    const request = toApiRequest(req);
    const response = await handleApiRequest(request, deps);
    res.statusCode = response.status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(response.body));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "internal error" }));
  }
}
