# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**ジブキャリ** — 日本語の履歴書作成Webアプリ。ユーザーが複数形式（JIS・転職・新卒・バイト）の履歴書をオンラインで作成・PDF出力できる。

- **本番URL**: https://jibucari.vercel.app
- **GitHub**: https://github.com/yusukeyamanaka198510-max/jibucari
- **デプロイ**: `git push origin HEAD:main` → Vercel自動デプロイ

## コマンド

```bash
# 開発サーバー（node_modulesはメインプロジェクトに存在）
npm run dev
# ワークツリーから起動する場合
node "C:\Users\user\resume-platform\node_modules\next\dist\bin\next" dev

# ビルド・型チェック
npm run build
npm run type-check        # tsc --noEmit（Vercel本番ビルドと同じ厳格度）

# テスト
npm run test              # vitest（watchモード）
npx vitest run tests/unit/path/to/test.test.ts  # 単体テスト指定実行
npm run test:coverage     # カバレッジレポート生成

# リント
npm run lint
```

> **重要**: Vercelのビルドは`tsc --noEmit`より厳格。`npm run type-check`でローカル確認してからプッシュすること。`array[index]`などの配列アクセスは`?? fallback`でundefined対策が必要。

## アーキテクチャ

### ディレクトリ構成の考え方

```
src/
  domain/         # ドメイン層: エンティティ・ユースケース・リポジトリ interface
  infrastructure/ # インフラ層: Supabaseリポジトリ実装、クライアント生成
  store/          # Zustandストア（クライアント状態管理）
  app/            # Next.js App Router（pages + API routes）
  components/     # atoms → molecules → organisms → templates
  types/          # 共有型定義
  lib/            # ユーティリティ・モックデータ
```

### データフロー

```
UI (Server Component)
  └─ API Route (/api/resume/*)
      └─ SupabaseResumeRepository (infrastructure)
          └─ IResumeRepository (domain interface)

UI (Client Component)
  └─ Zustand Store (resumeStore/authStore/profileStore)
      └─ SupabaseAuthRepository / SupabaseProfileRepository
```

### Supabaseクライアントの使い分け

| 用途 | 関数 | ファイル |
|------|------|---------|
| Client Component | `createSupabaseBrowserClient()` | `infrastructure/supabase/browserClient.ts` |
| API Route (Server) | `createSupabaseServerClient()` | `infrastructure/supabase/serverClient.ts` |
| middleware | `createServerClient()` from `@supabase/ssr` | 直接使用 |

Supabase環境変数が未設定の場合、`createSupabaseBrowserClient()`はnullを返す。API routeではnullチェック後に401を返すパターンを使う。

### 認証・ルート保護

`src/middleware.ts`でSupabase auth guardを実装。`PROTECTED_PATHS`に含まれるルートは未ログインで`/login?next=...`にリダイレクト。

```typescript
const PROTECTED_PATHS = ["/dashboard", "/mypage", "/resume", "/cv", "/cover-letter", "/skill-sheet"];
// /admin は意図的に除外（ログイン不要）
```

Supabase環境変数が"dummy"/"placeholder"を含む場合はmiddlewareをスキップ（ローカル開発用フォールバック）。

### 履歴書フォーマット

`ResumeFormat = "jis" | "career_change" | "new_graduate" | "part_time"`

各フォーマットに対応するPDFドキュメントコンポーネントが`src/components/pdf/`に存在。

### Zustandストアのパターン

- `immer`ミドルウェアでイミュータブル更新
- `persist`ミドルウェアでlocalStorageに自動保存（resume, saved一覧）
- ストアキー: `"resume-platform-store"`

### 管理画面（/admin）

現状は**モックデータのみ**（`src/lib/adminMockData.ts`）。Supabase未接続。

- `AdminUser`, `AdminResume`, `ActionLog` 型と8件のサンプルデータ
- チャート用ヘルパー: `getUserRegistrationTrend()`, `getAccessTrend()`, `getEducationSegments()`
- APIルート (`/api/admin/*`) はモックデータをJSONで返すのみ
- SVGチャートは外部ライブラリ不使用（`DashboardCharts.tsx`に純粋SVG実装）

### 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# メール送信（nodemailer）
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
```

## テスト構成

```
tests/unit/
  domain/          # エンティティの純粋関数テスト
  hooks/           # カスタムフックテスト
  infrastructure/  # リポジトリ実装テスト（Supabaseモック）
  store/           # Zustandストアテスト
```

vitest + jsdom環境。`@`エイリアスは`src/`を指す。

## デプロイ注意事項

- ワークツリーブランチ `claude/dreamy-ardinghelli-fff45e` から `git push origin HEAD:main` でmainを更新
- Vercelはmain pushで自動ビルド開始（約40秒）
- ビルドエラーはVercel CLIで確認: `npx vercel ls` → エラーのデプロイURLを `npx vercel inspect <url> --logs` で調査
