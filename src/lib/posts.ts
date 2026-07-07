import { getSql } from "@/lib/db";

export type PostCategory = "letter" | "news";

export interface Post {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  post_date: string; // YYYY-MM-DD (관리자가 지정하는 글 날짜)
  created_at: string;
  updated_at: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 날짜/타임스탬프는 ::text로 캐스팅해 "YYYY-MM-DD" 문자열로 받는다(타임존 오류 방지).
export async function getLetters(): Promise<Post[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, category, title, content,
           post_date::text AS post_date,
           created_at::text AS created_at,
           updated_at::text AS updated_at
    FROM posts
    WHERE category = 'letter'
    ORDER BY post_date DESC, created_at DESC`;
  return rows as Post[];
}

export async function getAllPosts(): Promise<Post[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, category, title, content,
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
    SELECT id, category, title, content,
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
}): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO posts (category, title, content, post_date)
    VALUES (${input.category}, ${input.title}, ${input.content}, ${input.post_date})`;
}

export async function updatePost(
  id: string,
  input: { title: string; content: string; post_date: string },
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE posts
    SET title = ${input.title},
        content = ${input.content},
        post_date = ${input.post_date},
        updated_at = now()
    WHERE id = ${id}`;
}

export async function deletePost(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM posts WHERE id = ${id}`;
}
