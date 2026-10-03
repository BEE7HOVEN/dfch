import { getSql } from "@/lib/db";
import type { BoardCategory } from "@/lib/boards";

// "news"는 예전 스키마에 있던 분류값이라 남겨 둔다.
export type PostCategory = BoardCategory | "news";

export interface Post {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  post_date: string; // YYYY-MM-DD (관리자가 지정하는 글 날짜)
  audio_key: string | null; // R2에 저장된 녹음 파일 위치 (매일의 묵상)
  created_at: string;
  updated_at: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 날짜/타임스탬프는 ::text로 캐스팅해 "YYYY-MM-DD" 문자열로 받는다(타임존 오류 방지).
export async function getPostsByCategory(
  category: PostCategory,
): Promise<Post[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, category, title, content, audio_key,
           post_date::text AS post_date,
           created_at::text AS created_at,
           updated_at::text AS updated_at
    FROM posts
    WHERE category = ${category}
    ORDER BY post_date DESC, created_at DESC`;
  return rows as Post[];
}

export async function getAllPosts(): Promise<Post[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, category, title, content, audio_key,
           post_date::text AS post_date,
           created_at::text AS created_at,
           updated_at::text AS updated_at
    FROM posts
    ORDER BY post_date DESC, created_at DESC`;
  return rows as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  if (!UUID_RE.test(id)) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT id, category, title, content, audio_key,
           post_date::text AS post_date,
           created_at::text AS created_at,
           updated_at::text AS updated_at
    FROM posts
    WHERE id = ${id}`;
  return (rows[0] as Post) ?? null;
}

export async function createPost(input: {
  category: PostCategory;
  title: string;
  content: string;
  post_date: string;
  audio_key: string | null;
}): Promise<string> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO posts (category, title, content, post_date, audio_key)
    VALUES (${input.category}, ${input.title}, ${input.content}, ${input.post_date}, ${input.audio_key})
    RETURNING id`;
  return (rows[0] as { id: string }).id;
}

export async function updatePost(
  id: string,
  input: {
    title: string;
    content: string;
    post_date: string;
    audio_key: string | null;
  },
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE posts
    SET title = ${input.title},
        content = ${input.content},
        post_date = ${input.post_date},
        audio_key = ${input.audio_key},
        updated_at = now()
    WHERE id = ${id}`;
}

export async function deletePost(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

// ── 첨부 파일 (갤러리 사진, 주보 사진·PDF). 파일은 R2, 여기는 위치·크기만. ──

export interface Attachment {
  id: string;
  post_id: string;
  kind: "image" | "pdf";
  file_key: string;
  thumb_key: string | null;
  width: number | null;
  height: number | null;
  file_name: string | null;
  size_bytes: number | null;
  sort_order: number;
}

export type NewAttachment = Omit<Attachment, "id" | "post_id" | "sort_order">;

export async function getAttachments(postId: string): Promise<Attachment[]> {
  if (!UUID_RE.test(postId)) return [];
  const sql = getSql();
  const rows = await sql`
    SELECT id, post_id, kind, file_key, thumb_key, width, height, file_name, size_bytes, sort_order
    FROM attachments
    WHERE post_id = ${postId}
    ORDER BY sort_order, created_at`;
  return rows as Attachment[];
}

// 갤러리 목록용: 글마다 첫 사진(표지)과 사진 수.
export async function getAlbumCovers(
  postIds: string[],
): Promise<Map<string, { cover: Attachment; count: number }>> {
  const result = new Map<string, { cover: Attachment; count: number }>();
  if (postIds.length === 0) return result;
  const sql = getSql();
  const rows = (await sql`
    SELECT id, post_id, kind, file_key, thumb_key, width, height, file_name, size_bytes, sort_order
    FROM attachments
    WHERE post_id = ANY(${postIds}::uuid[]) AND kind = 'image'
    ORDER BY post_id, sort_order, created_at`) as Attachment[];
  for (const row of rows) {
    const entry = result.get(row.post_id);
    if (entry) entry.count++;
    else result.set(row.post_id, { cover: row, count: 1 });
  }
  return result;
}

export async function addAttachments(
  postId: string,
  items: NewAttachment[],
): Promise<void> {
  if (items.length === 0) return;
  const sql = getSql();
  const [{ next }] = (await sql`
    SELECT COALESCE(MAX(sort_order) + 1, 0)::int AS next
    FROM attachments WHERE post_id = ${postId}`) as { next: number }[];
  for (const [i, a] of items.entries()) {
    await sql`
      INSERT INTO attachments
        (post_id, kind, file_key, thumb_key, width, height, file_name, size_bytes, sort_order)
      VALUES (${postId}, ${a.kind}, ${a.file_key}, ${a.thumb_key}, ${a.width}, ${a.height},
              ${a.file_name}, ${a.size_bytes}, ${next + i})`;
  }
}

// 지운 첨부의 R2 위치를 돌려준다(호출하는 쪽에서 R2 파일을 지운다).
export async function removeAttachments(
  postId: string,
  ids: string[],
): Promise<string[]> {
  const valid = ids.filter((id) => UUID_RE.test(id));
  if (valid.length === 0) return [];
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM attachments
    WHERE post_id = ${postId} AND id = ANY(${valid}::uuid[])
    RETURNING file_key, thumb_key`) as { file_key: string; thumb_key: string | null }[];
  return rows.flatMap((r) => [r.file_key, r.thumb_key].filter((k): k is string => !!k));
}
