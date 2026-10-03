"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth";
import {
  addAttachments,
  createPost,
  deletePost,
  getAttachments,
  getPost,
  removeAttachments,
  updatePost,
  type NewAttachment,
} from "@/lib/posts";
import { seoulToday } from "@/lib/format";
import { boards, isBoardCategory, type Board } from "@/lib/boards";
import { createUploadUrl, deleteObject, deleteObjectsQuietly } from "@/lib/r2";

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

// ── 사진·PDF 첨부 (갤러리, 주보) ──
// 사진은 브라우저에서 JPEG로 줄여 올리므로 형식이 정해져 있다. 본사진과 미리보기를 한 쌍으로 올린다.
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BYTES = 30 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 60;
const ATTACHMENT_KEY_RE =
  /^(gallery|bulletin)\/\d{4}-\d{2}-\d{2}-[0-9a-f-]{36}(_t)?\.(jpg|pdf)$/;

export type AttachmentUploadTarget =
  | { kind: "image"; fileKey: string; fileUrl: string; thumbKey: string; thumbUrl: string }
  | { kind: "pdf"; fileKey: string; fileUrl: string };

export type AttachmentUploadResult =
  | { ok: true; targets: AttachmentUploadTarget[] }
  | { ok: false; error: string };

export async function createAttachmentUploadAction(input: {
  category: string;
  files: { kind: "image" | "pdf"; size: number }[];
}): Promise<AttachmentUploadResult> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "로그인이 필요합니다. 다시 로그인해주세요." };
  }
  if (!isBoardCategory(input.category)) {
    return { ok: false, error: "잘못된 요청입니다." };
  }
  const board = boards[input.category];
  if (!board.attachments) return { ok: false, error: "잘못된 요청입니다." };
  if (input.files.length === 0 || input.files.length > MAX_FILES_PER_REQUEST) {
    return { ok: false, error: `한 번에 ${MAX_FILES_PER_REQUEST}개까지 올릴 수 있습니다.` };
  }
  for (const f of input.files) {
    if (f.kind === "pdf" && board.attachments !== "images+pdf") {
      return { ok: false, error: "사진만 올릴 수 있습니다." };
    }
    const max = f.kind === "pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (!(f.size > 0) || f.size > max) {
      return {
        ok: false,
        error: f.kind === "pdf" ? "PDF는 30MB 이하만 올릴 수 있습니다." : "사진이 너무 큽니다.",
      };
    }
  }

  try {
    const targets: AttachmentUploadTarget[] = [];
    for (const f of input.files) {
      const base = `${board.category}/${seoulToday()}-${crypto.randomUUID()}`;
      if (f.kind === "pdf") {
        const fileKey = `${base}.pdf`;
        targets.push({ kind: "pdf", fileKey, fileUrl: await createUploadUrl(fileKey) });
      } else {
        const fileKey = `${base}.jpg`;
        const thumbKey = `${base}_t.jpg`;
        targets.push({
          kind: "image",
          fileKey,
          fileUrl: await createUploadUrl(fileKey),
          thumbKey,
          thumbUrl: await createUploadUrl(thumbKey),
        });
      }
    }
    return { ok: true, targets };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "파일 저장소 설정을 확인해주세요." };
  }
}

// 폼의 숨은 칸(JSON)에서 새 첨부 목록을 읽는다. 우리가 발급한 형식의 위치만 받는다.
function readNewAttachments(formData: FormData, board: Board): NewAttachment[] {
  if (!board.attachments) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("attachments") ?? "[]"));
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const prefix = `${board.category}/`;
  const okKey = (k: unknown): k is string =>
    typeof k === "string" && k.startsWith(prefix) && ATTACHMENT_KEY_RE.test(k);
  const num = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) ? Math.round(n) : null;

  return raw.flatMap((a): NewAttachment[] => {
    if (!a || typeof a !== "object") return [];
    const o = a as Record<string, unknown>;
    if (o.kind === "image" && okKey(o.file_key) && okKey(o.thumb_key)) {
      return [{
        kind: "image",
        file_key: o.file_key,
        thumb_key: o.thumb_key,
        width: num(o.width),
        height: num(o.height),
        file_name: typeof o.file_name === "string" ? o.file_name.slice(0, 200) : null,
        size_bytes: num(o.size_bytes),
      }];
    }
    if (o.kind === "pdf" && board.attachments === "images+pdf" && okKey(o.file_key)) {
      return [{
        kind: "pdf",
        file_key: o.file_key,
        thumb_key: null,
        width: null,
        height: null,
        file_name: typeof o.file_name === "string" ? o.file_name.slice(0, 200) : null,
        size_bytes: num(o.size_bytes),
      }];
    }
    return [];
  });
}

function readRemovedAttachmentIds(formData: FormData): string[] {
  try {
    const raw = JSON.parse(String(formData.get("remove_attachments") ?? "[]"));
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// 제목을 비워 둘 수 있는 게시판(주보)은 날짜로 제목을 만든다.
function defaultTitle(board: Board, postDate: string): string {
  const [y, m, d] = postDate.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 ${board.label}`;
}

function validate(
  board: Board,
  fields: { title: string; content: string; audio_key: string | null; attachmentCount: number },
): string | null {
  if (!fields.title) return `${board.titleLabel}을(를) 입력해주세요.`;
  if (board.contentRequired && !fields.content) return "내용을 입력해주세요.";
  if (board.hasAudio && !fields.audio_key) return "녹음 파일을 올려주세요.";
  if (board.attachments && fields.attachmentCount === 0) {
    return board.attachments === "images" ? "사진을 한 장 이상 올려주세요." : "주보 파일을 올려주세요.";
  }
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
  const post_date = normalizeDate(formData.get("post_date"));
  const rawTitle = String(formData.get("title") ?? "").trim();
  const title = rawTitle || (board.titleRequired ? "" : defaultTitle(board, post_date));
  const content = String(formData.get("content") ?? "").trim();
  const audio_key = board.hasAudio ? readAudioKey(formData) : null;
  const attachments = readNewAttachments(formData, board);
  const error = validate(board, {
    title,
    content,
    audio_key,
    attachmentCount: attachments.length,
  });
  if (error) return { error };

  const id = await createPost({ category, title, content, post_date, audio_key });
  await addAttachments(id, attachments);
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
  const post_date = normalizeDate(formData.get("post_date"));
  const rawTitle = String(formData.get("title") ?? "").trim();
  const title = rawTitle || (board.titleRequired ? "" : defaultTitle(board, post_date));
  const content = String(formData.get("content") ?? "").trim();
  // 새 녹음을 올리지 않았으면 기존 녹음을 유지한다.
  const audio_key = board.hasAudio
    ? (readAudioKey(formData) ?? existing.audio_key)
    : null;
  const added = readNewAttachments(formData, board);
  const removedIds = readRemovedAttachmentIds(formData);
  const current = board.attachments ? await getAttachments(id) : [];
  const remaining = current.filter((a) => !removedIds.includes(a.id)).length;
  const error = validate(board, {
    title,
    content,
    audio_key,
    attachmentCount: remaining + added.length,
  });
  if (error) return { error };

  await updatePost(id, { title, content, post_date, audio_key });
  await addAttachments(id, added);
  const removedKeys = await removeAttachments(id, removedIds);
  await deleteObjectsQuietly(removedKeys);
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
    const files = await getAttachments(id);
    await deletePost(id); // 첨부 행은 DB에서 함께 지워진다(ON DELETE CASCADE)
    await deleteAudioQuietly(existing.audio_key);
    await deleteObjectsQuietly(
      files.flatMap((f) => [f.file_key, f.thumb_key].filter((k): k is string => !!k)),
    );
    for (const board of Object.values(boards)) revalidatePath(board.path);
    revalidatePath("/admin");
  }
  redirect("/admin");
}
