-- 메인 행사 배너용 칸: 누르면 갈 링크와 게시 종료일. 다른 게시판 글에서는 비어 있다(기존 데이터·코드에 영향 없음).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_url text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ends_on date;
