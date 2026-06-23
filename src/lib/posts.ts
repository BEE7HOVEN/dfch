import { getSupabase } from "@/lib/supabase";

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

export async function getLetters(): Promise<Post[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("category", "letter")
    .order("post_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Post[];
}

export async function getAllPosts(): Promise<Post[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("post_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Post) ?? null;
}

export async function createPost(input: {
  category: PostCategory;
  title: string;
  content: string;
  post_date: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("posts").insert({
    category: input.category,
    title: input.title,
    content: input.content,
    post_date: input.post_date,
  });
  if (error) throw new Error(error.message);
}

export async function updatePost(
  id: string,
  input: { title: string; content: string; post_date: string },
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .update({
      title: input.title,
      content: input.content,
      post_date: input.post_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePost(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
