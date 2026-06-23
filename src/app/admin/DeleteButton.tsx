"use client";

import { deleteLetterAction } from "@/app/admin/actions";

export default function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteLetterAction}
      onSubmit={(e) => {
        if (!confirm("이 글을 삭제할까요? 되돌릴 수 없습니다.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-700 transition-colors"
      >
        삭제
      </button>
    </form>
  );
}
