-- ============================================================
-- ヤギ履歴書 初期スキーマ
-- ============================================================

-- resumes テーブル
-- personal_info, education, work_history などは JSONB で保持し、
-- スキーマ変更なしにフィールド追加できる柔軟な設計とする。
CREATE TABLE IF NOT EXISTS public.resumes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  format          TEXT NOT NULL DEFAULT 'jis'
                    CHECK (format IN ('jis','career_change','new_graduate','part_time')),
  title           TEXT NOT NULL DEFAULT '新しい履歴書',
  personal_info   JSONB NOT NULL DEFAULT '{}',
  education       JSONB NOT NULL DEFAULT '[]',
  work_history    JSONB NOT NULL DEFAULT '[]',
  licenses        JSONB NOT NULL DEFAULT '[]',
  motivation      TEXT NOT NULL DEFAULT '',
  self_pr         TEXT NOT NULL DEFAULT '',
  hobbies         TEXT NOT NULL DEFAULT '',
  commute         TEXT,
  dependents      SMALLINT,
  spouse_dependent BOOLEAN,
  desired_salary  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 更新時に updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS (Row Level Security) — ユーザーは自分の書類のみ操作可能
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resumes_select_own" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "resumes_insert_own" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resumes_update_own" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "resumes_delete_own" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS resumes_updated_at_idx ON public.resumes (updated_at DESC);
