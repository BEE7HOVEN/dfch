-- 갤러리 사진·주보 사진/PDF 같은 글 첨부 파일 표. 파일 자체는 R2에 있고 여기에는 위치와 크기만 둔다.
-- 글을 지우면 첨부 행도 함께 지워진다(R2 파일은 앱 코드에서 지운다). 기존 posts 표는 바꾸지 않는다.

CREATE TABLE IF NOT EXISTS attachments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('image', 'pdf')),
  file_key    text NOT NULL,
  thumb_key   text,
  width       integer,
  height      integer,
  file_name   text,
  size_bytes  integer,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attachments_post_id_sort_idx ON attachments (post_id, sort_order);
