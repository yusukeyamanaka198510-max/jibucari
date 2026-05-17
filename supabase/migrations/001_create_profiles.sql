-- ユーザープロフィールテーブル
-- Supabase SQL Editor で実行してください

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  last_name        text not null default '',
  first_name       text not null default '',
  last_name_kana   text not null default '',
  first_name_kana  text not null default '',
  birth_date       text not null default '',
  gender           text not null default '',
  postal_code      text not null default '',
  prefecture       text not null default '',
  city             text not null default '',
  address_detail   text not null default '',
  phone            text not null default '',
  email            text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at を自動更新するトリガー
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
