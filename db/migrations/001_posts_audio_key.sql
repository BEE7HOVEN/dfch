-- 매일의 묵상 녹음 파일 위치(R2 객체 키)를 저장할 칸 추가.
-- 2026-10-03 확인: posts.category에는 CHECK 제약이 없어 'meditation'을 그대로 저장할 수 있다.
-- 비어 있어도 되는 칸이고 기본값이 없어서, 기존 목회편지 글과 지금 운영 중인 코드에는 영향이 없다.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_key text;
