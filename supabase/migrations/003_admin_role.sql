-- 管理者フラグをprofilesテーブルに追加
-- 本番適用前にSupabase SQL Editorで実行してください

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 管理者のみ全プロフィールを閲覧できるポリシー
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- 初期管理者の設定例（メールアドレスで指定）
-- update public.profiles
--   set is_admin = true
--   where email = 'admin@example.com';
