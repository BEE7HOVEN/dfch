"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
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
    <form
      // action={formAction}으로 넘기면 React가 저장이 끝난 뒤 칸을 자동으로 비워서,
      // 오류로 막혔을 때 입력한 내용이 사라진다. 직접 제출해 칸을 그대로 둔다.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-6"
    >
      {post && <input type="hidden" name="id" value={post.id} />}

      <input type="hidden" name="category" value={board.category} />

      <div>
        <label htmlFor="post_date" className="block text-sm text-sub mb-2">
          {board.dateLabel ?? "날짜"}
        </label>
        <input
          id="post_date"
          name="post_date"
          type="date"
          defaultValue={defaultDate}
          required
          className="px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm text-sub mb-2">
          {board.titleLabel}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={post?.title ?? ""}
          placeholder={board.titlePlaceholder}
          required={board.titleRequired}
          className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
      </div>

      {board.bannerFields && (
        <>
          <div>
            <label htmlFor="ends_on" className="block text-sm text-sub mb-2">
              게시 종료일 (선택)
            </label>
            <input
              id="ends_on"
              name="ends_on"
              type="date"
              defaultValue={post?.ends_on ?? ""}
              className="px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
            <p className="mt-2 text-xs text-mute">
              이 날이 지나면 메인에서 자동으로 내려갑니다. 비워 두면 직접 지울 때까지 보입니다.
            </p>
          </div>
          <div>
            <label htmlFor="link_url" className="block text-sm text-sub mb-2">
              누르면 갈 주소 (선택)
            </label>
            <input
              id="link_url"
              name="link_url"
              type="text"
              inputMode="url"
              defaultValue={post?.link_url ?? ""}
              placeholder="예: /news/notice/… 또는 https://…"
              className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>
        </>
      )}

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
        <label htmlFor="content" className="block text-sm text-sub mb-2">
          {board.contentLabel}
        </label>
        <textarea
          id="content"
          name="content"
          rows={board.contentRequired ? 16 : 5}
          defaultValue={post?.content ?? ""}
          required={board.contentRequired}
          className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30 leading-relaxed resize-y"
        />
        <p className="mt-2 text-xs text-mute">
          줄바꿈은 그대로 화면에 표시됩니다. 문단을 나누려면 엔터를 눌러주세요.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest-deep transition-colors disabled:opacity-50"
        >
          {pending ? "저장 중..." : uploading ? "업로드 중..." : submitLabel}
        </button>
        <Link
          href="/admin"
          className="px-6 py-3 text-sub hover:text-forest transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
