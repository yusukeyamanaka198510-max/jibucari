-- Add university_name column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS university_name TEXT;

-- Update admin_search_users to include university_name in output
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
      'universityName',  p.university_name,
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
