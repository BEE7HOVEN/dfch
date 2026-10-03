"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth";
import { createPost, updatePost, deletePost, getPost } from "@/lib/posts";
import { seoulToday } from "@/lib/format";
import { boards, isBoardCategory, type Board } from "@/lib/boards";
import { createUploadUrl, deleteObject } from "@/lib/r2";

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

// 휴대폰 녹음 앱에서 주로 나오는 형식. 확장자로 판단하고 재생용 Content-Type을 정한다.
const AUDIO_TYPES: Record<string, string> = {
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  mp3: "audio/mpeg",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  webm: "audio/webm",
  amr: "audio/amr",
  "3gp": "audio/3gpp",
  caf: "audio/x-caf",
};
const MAX_AUDIO_BYTES = 100 * 1024 * 1024; // 100MB
const AUDIO_KEY_RE = /^meditation\/\d{4}-\d{2}-\d{2}-[0-9a-f-]{36}\.[0-9a-z]+$/;

export type AudioUploadResult =
  | { ok: true; key: string; uploadUrl: string; contentType: string }
  | { ok: false; error: string };

// 브라우저가 R2로 직접 올릴 수 있는 10분짜리 업로드 주소를 발급한다.
export async function createAudioUploadAction(input: {
  fileName: string;
  size: number;
}): Promise<AudioUploadResult> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "로그인이 필요합니다. 다시 로그인해주세요." };
  }
  const ext = input.fileName.split(".").pop()?.toLowerCase() ?? "";
  const contentType = AUDIO_TYPES[ext];
  if (!contentType) {
    return {
      ok: false,
      error: "녹음 파일(m4a, mp3, wav 등)만 올릴 수 있습니다.",
    };
  }
  if (!(input.size > 0) || input.size > MAX_AUDIO_BYTES) {
    return { ok: false, error: "100MB 이하의 파일만 올릴 수 있습니다." };
  }

  const key = `meditation/${seoulToday()}-${crypto.randomUUID()}.${ext}`;
  try {
    return { ok: true, key, uploadUrl: await createUploadUrl(key), contentType };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "파일 저장소 설정을 확인해주세요." };
  }
}

// 폼에서 넘어온 audio_key는 우리가 발급한 형식일 때만 받는다.
function readAudioKey(formData: FormData): string | null {
  const v = String(formData.get("audio_key") ?? "").trim();
  return AUDIO_KEY_RE.test(v) ? v : null;
}

async function deleteAudioQuietly(key: string | null) {
  if (!key) return;
  try {
    await deleteObject(key);
  } catch (e) {
    console.error(e); // 파일이 남아도 글 저장·삭제는 막지 않는다.
  }
}

function validate(
  board: Board,
  fields: { title: string; content: string; audio_key: string | null },
): string | null {
  if (!fields.title) return `${board.titleLabel}을(를) 입력해주세요.`;
  if (board.contentRequired && !fields.content) return "내용을 입력해주세요.";
  if (board.hasAudio && !fields.audio_key) return "녹음 파일을 올려주세요.";
  return null;
}

export async function createPostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const category = formData.get("category");
  if (!isBoardCategory(category)) return { error: "잘못된 요청입니다." };
  const board = boards[category];
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const post_date = normalizeDate(formData.get("post_date"));
  const audio_key = board.hasAudio ? readAudioKey(formData) : null;
  const error = validate(board, { title, content, audio_key });
  if (error) return { error };

  await createPost({ category, title, content, post_date, audio_key });
  revalidatePath(board.path);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const existing = await getPost(id);
  if (!existing || !isBoardCategory(existing.category)) {
    return { error: "잘못된 요청입니다." };
  }
  const board = boards[existing.category];
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const post_date = normalizeDate(formData.get("post_date"));
  // 새 녹음을 올리지 않았으면 기존 녹음을 유지한다.
  const audio_key = board.hasAudio
    ? (readAudioKey(formData) ?? existing.audio_key)
    : null;
  const error = validate(board, { title, content, audio_key });
  if (error) return { error };

  await updatePost(id, { title, content, post_date, audio_key });
  if (existing.audio_key !== audio_key) {
    await deleteAudioQuietly(existing.audio_key);
  }
  revalidatePath(board.path);
  revalidatePath(`${board.path}/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const existing = await getPost(id);
  if (existing) {
    await deletePost(id);
    await deleteAudioQuietly(existing.audio_key);
    for (const board of Object.values(boards)) revalidatePath(board.path);
    revalidatePath("/admin");
  }
  redirect("/admin");
}
