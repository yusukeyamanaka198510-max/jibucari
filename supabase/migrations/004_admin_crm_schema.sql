-- ============================================================
-- ジブキャリ 管理CRMスキーマ (004)
-- 管理画面の大型アップデート用テーブル群
-- ============================================================

-- ────────────────────────────────────────────
-- 1. profiles テーブルに属性カラムを追加
-- ────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS education_level  TEXT,
  ADD COLUMN IF NOT EXISTS job_hunt_status  TEXT,
  ADD COLUMN IF NOT EXISTS desired_industry TEXT[],
  ADD COLUMN IF NOT EXISTS is_guest         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_active_at   TIMESTAMPTZ,
  -- street_address / building が未作成の場合も考慮
  ADD COLUMN IF NOT EXISTS street_address   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS building         TEXT NOT NULL DEFAULT '';

-- education_level 許容値
-- 'middle','high','high_dropout','uni','uni_dropout','grad','grad_dropout','enrolled'
-- job_hunt_status 許容値
-- 'new_grad','second_new_grad','first_job','career_change'

-- ────────────────────────────────────────────
-- 2. action_logs（全ユーザーの行動イベント）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.action_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT        NOT NULL,
  target_id   UUID,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_logs_user_id    ON public.action_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_logs_type_date  ON public.action_logs (action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON public.action_logs (created_at DESC);

ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のログのみ INSERT 可
CREATE POLICY "action_logs_insert_own"
  ON public.action_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分のログのみ SELECT 可
CREATE POLICY "action_logs_select_own"
  ON public.action_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- 3. page_sessions（ページ滞在・離脱ポイント）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.page_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key  TEXT        NOT NULL,
  page         TEXT        NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at     TIMESTAMPTZ,
  duration_sec INTEGER,
  exit_field   TEXT,           -- 離脱したフィールド or セクション名
  is_completed BOOLEAN     NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_page_sessions_user_id ON public.page_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_sessions_page    ON public.page_sessions (page, started_at DESC);

ALTER TABLE public.page_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_sessions_insert"
  ON public.page_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "page_sessions_update_own"
  ON public.page_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ────────────────────────────────────────────
-- 4. page_events（フィールド入力・スクロールイベント）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.page_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID        NOT NULL REFERENCES public.page_sessions(id) ON DELETE CASCADE,
  event_type   TEXT        NOT NULL,  -- 'field_focus','field_blur','field_input','scroll','submit','exit'
  field_name   TEXT,
  value_length INTEGER,
  scroll_pct   SMALLINT,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_events_session    ON public.page_events (session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_page_events_field_name ON public.page_events (field_name, event_type);

ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_events_insert"
  ON public.page_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.page_sessions s
      WHERE s.id = session_id
        AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

-- ────────────────────────────────────────────
-- 5. daily_stats（ダッシュボード高速化用 日次集計）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_stats (
  date                DATE PRIMARY KEY,
  new_users           INTEGER NOT NULL DEFAULT 0,
  active_users        INTEGER NOT NULL DEFAULT 0,
  guest_sessions      INTEGER NOT NULL DEFAULT 0,
  member_sessions     INTEGER NOT NULL DEFAULT 0,
  pdf_downloads       INTEGER NOT NULL DEFAULT 0,
  pdf_emails          INTEGER NOT NULL DEFAULT 0,
  interview_requests  INTEGER NOT NULL DEFAULT 0,
  resumes_created     INTEGER NOT NULL DEFAULT 0,
  resumes_updated     INTEGER NOT NULL DEFAULT 0
);

-- ────────────────────────────────────────────
-- 6. contact_logs（管理者 → ユーザーへのコンタクト記録）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_type TEXT        NOT NULL DEFAULT 'note',  -- 'email','note','phone','meeting'
  subject      TEXT,
  body         TEXT        NOT NULL,
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_logs_user_id ON public.contact_logs (user_id, created_at DESC);

ALTER TABLE public.contact_logs ENABLE ROW LEVEL SECURITY;
-- 管理者のみ（service_role で全権限）
-- anon/authenticated はアクセス不可

-- ────────────────────────────────────────────
-- 7. user_tags（セグメントタグ）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_tags (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag        TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags (user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag     ON public.user_tags (tag);

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
-- 管理者のみ（service_role）

-- ────────────────────────────────────────────
-- 8. email_campaigns（メール配信キャンペーン）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_type     TEXT        NOT NULL DEFAULT 'bulk',  -- 'bulk','individual'
  subject           TEXT        NOT NULL,
  body_html         TEXT        NOT NULL,
  filter_conditions JSONB       NOT NULL DEFAULT '{}',
  recipient_count   INTEGER     NOT NULL DEFAULT 0,
  status            TEXT        NOT NULL DEFAULT 'draft',  -- 'draft','sending','sent','failed'
  scheduled_at      TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status     ON public.email_campaigns (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns (created_at DESC);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
-- 管理者のみ（service_role）

-- ────────────────────────────────────────────
-- 9. email_send_logs（個別送信ログ）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_send_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID        REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email    TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'pending',  -- 'pending','sent','failed','bounced'
  error_msg   TEXT,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_campaign ON public.email_send_logs (campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_send_logs_user_id  ON public.email_send_logs (user_id, sent_at DESC);

ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;
-- 管理者のみ（service_role）

-- ────────────────────────────────────────────
-- 10. articles（記事・コンテンツ管理）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  slug          TEXT        UNIQUE,
  content       TEXT        NOT NULL DEFAULT '',
  excerpt       TEXT,
  category      TEXT        NOT NULL DEFAULT 'advice',  -- 'advice','real_story','news','tips'
  status        TEXT        NOT NULL DEFAULT 'draft',   -- 'draft','published','archived'
  thumbnail_url TEXT,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_status   ON public.articles (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 公開記事は誰でも閲覧可
CREATE POLICY "articles_select_published"
  ON public.articles FOR SELECT
  USING (status = 'published');

-- ────────────────────────────────────────────
-- 11. admin_operation_logs（管理者操作履歴）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_operation_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  operation_type TEXT        NOT NULL,  -- 'create','update','delete','send_email','publish_article'
  target_type    TEXT        NOT NULL,  -- 'article','user','campaign','contact_log'
  target_id      UUID,
  summary        TEXT,
  diff           JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_op_logs_created ON public.admin_operation_logs (created_at DESC);

ALTER TABLE public.admin_operation_logs ENABLE ROW LEVEL SECURITY;
-- 管理者のみ（service_role）

-- ────────────────────────────────────────────
-- 12. articles の updated_at 自動更新トリガー
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at_articles()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_updated_at ON public.articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_articles();

DROP TRIGGER IF EXISTS email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_articles();

-- ────────────────────────────────────────────
-- 13. 管理者ユーザー検索 RPC 関数
--     service_role からのみ呼ばれる想定
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_search_users(
  p_query          TEXT    DEFAULT NULL,
  p_education      TEXT    DEFAULT NULL,
  p_job_status     TEXT    DEFAULT NULL,
  p_prefecture     TEXT    DEFAULT NULL,
  p_gender         TEXT    DEFAULT NULL,
  p_age_min        INT     DEFAULT NULL,
  p_age_max        INT     DEFAULT NULL,
  p_tag            TEXT    DEFAULT NULL,
  p_action_type    TEXT    DEFAULT NULL,
  p_reg_from       DATE    DEFAULT NULL,
  p_reg_to         DATE    DEFAULT NULL,
  p_sort_by        TEXT    DEFAULT 'created_at',
  p_sort_dir       TEXT    DEFAULT 'desc',
  p_page           INT     DEFAULT 1,
  p_per_page       INT     DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_offset  INT;
  v_total   INT;
  v_rows    JSONB;
BEGIN
  v_offset := (p_page - 1) * p_per_page;

  -- 総件数取得
  SELECT COUNT(DISTINCT p.id) INTO v_total
  FROM profiles p
  WHERE
    (p_query IS NULL OR (
      p.last_name  ILIKE '%' || p_query || '%' OR
      p.first_name ILIKE '%' || p_query || '%' OR
      p.email      ILIKE '%' || p_query || '%'
    ))
    AND (p_education  IS NULL OR p.education_level = p_education)
    AND (p_job_status IS NULL OR p.job_hunt_status = p_job_status)
    AND (p_prefecture IS NULL OR p.prefecture = p_prefecture)
    AND (p_gender     IS NULL OR p.gender = p_gender)
    AND (p_age_min    IS NULL OR
         EXTRACT(YEAR FROM AGE(NOW(), p.birth_date::DATE)) >= p_age_min)
    AND (p_age_max    IS NULL OR
         EXTRACT(YEAR FROM AGE(NOW(), p.birth_date::DATE)) <= p_age_max)
    AND (p_reg_from   IS NULL OR p.created_at::DATE >= p_reg_from)
    AND (p_reg_to     IS NULL OR p.created_at::DATE <= p_reg_to)
    AND (p_tag IS NULL OR EXISTS (
      SELECT 1 FROM user_tags t WHERE t.user_id = p.id AND t.tag = p_tag
    ))
    AND (p_action_type IS NULL OR EXISTS (
      SELECT 1 FROM action_logs a WHERE a.user_id = p.id AND a.action_type = p_action_type
    ));

  -- データ取得
  SELECT jsonb_agg(row_data) INTO v_rows
  FROM (
    SELECT jsonb_build_object(
      'id',              p.id,
      'email',           p.email,
      'lastName',        p.last_name,
      'firstName',       p.first_name,
      'lastNameKana',    p.last_name_kana,
      'firstNameKana',   p.first_name_kana,
      'birthDate',       p.birth_date,
      'gender',          p.gender,
      'prefecture',      p.prefecture,
      'educationLevel',  p.education_level,
      'jobHuntStatus',   p.job_hunt_status,
      'desiredIndustry', p.desired_industry,
      'lastActiveAt',    p.last_active_at,
      'createdAt',       p.created_at,
      'resumeCount',     (SELECT COUNT(*) FROM resumes r WHERE r.user_id = p.id),
      'actionCount',     (SELECT COUNT(*) FROM action_logs a WHERE a.user_id = p.id),
      'pdfDownloadCount',(SELECT COUNT(*) FROM action_logs a
                          WHERE a.user_id = p.id AND a.action_type = 'pdf_download'),
      'pdfEmailCount',   (SELECT COUNT(*) FROM action_logs a
                          WHERE a.user_id = p.id AND a.action_type = 'pdf_email'),
      'interviewCount',  (SELECT COUNT(*) FROM action_logs a
                          WHERE a.user_id = p.id AND a.action_type = 'interview_request'),
      'tags',            COALESCE((
                           SELECT jsonb_agg(t.tag)
                           FROM user_tags t WHERE t.user_id = p.id
                         ), '[]'::JSONB)
    ) AS row_data
    FROM profiles p
    WHERE
      (p_query IS NULL OR (
        p.last_name  ILIKE '%' || p_query || '%' OR
        p.first_name ILIKE '%' || p_query || '%' OR
        p.email      ILIKE '%' || p_query || '%'
      ))
      AND (p_education  IS NULL OR p.education_level = p_education)
      AND (p_job_status IS NULL OR p.job_hunt_status = p_job_status)
      AND (p_prefecture IS NULL OR p.prefecture = p_prefecture)
      AND (p_gender     IS NULL OR p.gender = p_gender)
      AND (p_age_min    IS NULL OR
           EXTRACT(YEAR FROM AGE(NOW(), p.birth_date::DATE)) >= p_age_min)
      AND (p_age_max    IS NULL OR
           EXTRACT(YEAR FROM AGE(NOW(), p.birth_date::DATE)) <= p_age_max)
      AND (p_reg_from   IS NULL OR p.created_at::DATE >= p_reg_from)
      AND (p_reg_to     IS NULL OR p.created_at::DATE <= p_reg_to)
      AND (p_tag IS NULL OR EXISTS (
        SELECT 1 FROM user_tags t WHERE t.user_id = p.id AND t.tag = p_tag
      ))
      AND (p_action_type IS NULL OR EXISTS (
        SELECT 1 FROM action_logs a WHERE a.user_id = p.id AND a.action_type = p_action_type
      ))
    ORDER BY
      CASE WHEN p_sort_by = 'created_at'   AND p_sort_dir = 'desc' THEN p.created_at  END DESC,
      CASE WHEN p_sort_by = 'created_at'   AND p_sort_dir = 'asc'  THEN p.created_at  END ASC,
      CASE WHEN p_sort_by = 'last_active_at' AND p_sort_dir = 'desc' THEN p.last_active_at END DESC,
      CASE WHEN p_sort_by = 'last_active_at' AND p_sort_dir = 'asc'  THEN p.last_active_at END ASC,
      p.created_at DESC
    LIMIT p_per_page OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'data',       COALESCE(v_rows, '[]'::JSONB),
    'total',      v_total,
    'page',       p_page,
    'perPage',    p_per_page,
    'totalPages', CEIL(v_total::FLOAT / p_per_page)
  );
END;
$$;

-- ────────────────────────────────────────────
-- 14. 日次集計更新 関数（pg_cron または手動で呼ぶ）
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_daily_stats(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO daily_stats (
    date, new_users, active_users,
    pdf_downloads, pdf_emails, interview_requests,
    resumes_created, resumes_updated
  )
  SELECT
    p_date,
    (SELECT COUNT(*) FROM profiles WHERE created_at::DATE = p_date),
    (SELECT COUNT(DISTINCT user_id) FROM action_logs WHERE created_at::DATE = p_date),
    (SELECT COUNT(*) FROM action_logs WHERE action_type = 'pdf_download'        AND created_at::DATE = p_date),
    (SELECT COUNT(*) FROM action_logs WHERE action_type = 'pdf_email'           AND created_at::DATE = p_date),
    (SELECT COUNT(*) FROM action_logs WHERE action_type = 'interview_request'   AND created_at::DATE = p_date),
    (SELECT COUNT(*) FROM action_logs WHERE action_type = 'resume_created'      AND created_at::DATE = p_date),
    (SELECT COUNT(*) FROM action_logs WHERE action_type = 'resume_updated'      AND created_at::DATE = p_date)
  ON CONFLICT (date) DO UPDATE SET
    new_users          = EXCLUDED.new_users,
    active_users       = EXCLUDED.active_users,
    pdf_downloads      = EXCLUDED.pdf_downloads,
    pdf_emails         = EXCLUDED.pdf_emails,
    interview_requests = EXCLUDED.interview_requests,
    resumes_created    = EXCLUDED.resumes_created,
    resumes_updated    = EXCLUDED.resumes_updated;
END;
$$;
