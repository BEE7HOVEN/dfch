"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth";
import { createPost, updatePost, deletePost } from "@/lib/posts";
import { seoulToday } from "@/lib/format";

export interface FormState {
  error?: string;
}

function normalizeDate(value: FormDataEntryValue | null): string {
  const v = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : seoulToday();
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = formData.get("password");
  if (!checkPassword(password)) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function createLetterAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const post_date = normalizeDate(formData.get("post_date"));
  if (!title || !content) {
    return { error: "제목과 내용을 모두 입력해주세요." };
  }

  await createPost({ category: "letter", title, content, post_date });
  revalidatePath("/letters");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateLetterAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const post_date = normalizeDate(formData.get("post_date"));
  if (!id) return { error: "잘못된 요청입니다." };
  if (!title || !content) {
    return { error: "제목과 내용을 모두 입력해주세요." };
  }

  await updatePost(id, { title, content, post_date });
  revalidatePath("/letters");
  revalidatePath(`/letters/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteLetterAction(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (id) {
    await deletePost(id);
    revalidatePath("/letters");
    revalidatePath("/admin");
  }
  redirect("/admin");
}
