-- Supabase SQL Editor에서 실행하세요.

-- 1. post 테이블에 조회수 컬럼 추가
ALTER TABLE post ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0 NOT NULL;

-- 2. 페이지별 방문자 수 테이블 생성
CREATE TABLE IF NOT EXISTS page_views (
  page       TEXT PRIMARY KEY,
  views      INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 홈 페이지 row 초기화
INSERT INTO page_views (page, views)
VALUES ('home', 0)
ON CONFLICT (page) DO NOTHING;

-- 4. 글 조회수 증가 함수 (anon 사용자도 호출 가능)
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE post SET views = views + 1 WHERE id = post_id RETURNING views;
$$;

-- 5. 페이지 조회수 증가 함수 (anon 사용자도 호출 가능)
CREATE OR REPLACE FUNCTION increment_page_views(page_name TEXT)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO page_views (page, views)
  VALUES (page_name, 1)
  ON CONFLICT (page) DO UPDATE
    SET views      = page_views.views + 1,
        updated_at = NOW()
  RETURNING views;
$$;

-- 6. anon 역할에 실행 권한 부여
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_page_views(TEXT) TO anon;

-- 7. page_views 읽기 권한 설정
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow public read" ON page_views FOR SELECT USING (true);
