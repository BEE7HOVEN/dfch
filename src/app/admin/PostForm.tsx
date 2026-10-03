"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/admin/actions";
import type { Post } from "@/lib/posts";
import type { Board } from "@/lib/boards";
import AudioUpload from "./AudioUpload";
import AttachmentUpload, { type ExistingAttachment } from "./AttachmentUpload";

interface PostFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  board: Board;
  post?: Post;
  existingAttachments?: ExistingAttachment[];
  defaultDate: string; // YYYY-MM-DD
  submitLabel: string;
}

const initialState: FormState = {};

export default function PostForm({
  action,
  board,
  post,
  existingAttachments,
  defaultDate,
  submitLabel,
}: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [uploading, setUploading] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <input type="hidden" name="category" value={board.category} />

      <div>
        <label htmlFor="post_date" className="block text-sm text-[#404040] mb-2">
          날짜
        </label>
        <input
          id="post_date"
          name="post_date"
          type="date"
          defaultValue={defaultDate}
          required
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#404040]/30"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm text-[#404040] mb-2">
          {board.titleLabel}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={post?.title ?? ""}
          placeholder={board.titlePlaceholder}
          required={board.titleRequired}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#404040]/30"
        />
      </div>

      {board.hasAudio && (
        <AudioUpload initialKey={post?.audio_key} onBusyChange={setUploading} />
      )}

      {board.attachments && (
        <AttachmentUpload
          category={board.category}
          mode={board.attachments}
          existing={existingAttachments}
          onBusyChange={setUploading}
        />
      )}

      <div>
        <label htmlFor="content" className="block text-sm text-[#404040] mb-2">
          {board.contentLabel}
        </label>
        <textarea
          id="content"
          name="content"
          rows={board.contentRequired ? 16 : 5}
          defaultValue={post?.content ?? ""}
          required={board.contentRequired}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#404040]/30 leading-relaxed resize-y"
        />
        <p className="mt-2 text-xs text-[#999]">
          줄바꿈은 그대로 화면에 표시됩니다. 문단을 나누려면 엔터를 눌러주세요.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="px-6 py-3 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#404040] transition-colors disabled:opacity-50"
        >
          {pending ? "저장 중..." : uploading ? "업로드 중..." : submitLabel}
        </button>
        <Link
          href="/admin"
          className="px-6 py-3 text-[#404040] hover:text-[#2c2c2c] transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
