"use client";
// 갤러리 사진·주보 사진/PDF를 여러 개 골라 브라우저에서 줄인 뒤 R2로 직접 올리는 입력칸.
// 올린 결과는 숨은 칸(attachments)에, 지우기로 표시한 기존 첨부는 숨은 칸(remove_attachments)에 JSON으로 넘긴다.

import { useEffect, useRef, useState } from "react";
import { createAttachmentUploadAction } from "@/app/admin/actions";
import { resizeForUpload } from "./imageResize";
import { putWithProgress } from "./upload";

export interface ExistingAttachment {
  id: string;
  kind: "image" | "pdf";
  thumbUrl: string | null;
  fileName: string | null;
}

interface NewItem {
  tempId: string;
  kind: "image" | "pdf";
  name: string;
  preview: string | null; // 미리보기 object URL
  status: "waiting" | "converting" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  meta?: Record<string, unknown>; // 저장 때 서버로 보낼 첨부 정보
}

const CONCURRENCY = 3;

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export default function AttachmentUpload({
  category,
  mode,
  existing = [],
  onBusyChange,
}: {
  category: string;
  mode: "images" | "images+pdf";
  existing?: ExistingAttachment[];
  onBusyChange: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<NewItem[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const previews = useRef<string[]>([]);

  const busy = items.some((i) => ["waiting", "converting", "uploading"].includes(i.status));
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const update = (tempId: string, patch: Partial<NewItem>) =>
    setItems((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, ...patch } : i)));

  async function uploadOne(item: NewItem, file: File) {
    try {
      if (item.kind === "pdf") {
        update(item.tempId, { status: "uploading" });
        const res = await createAttachmentUploadAction({
          category,
          files: [{ kind: "pdf", size: file.size }],
        });
        if (!res.ok) throw new Error(res.error);
        const t = res.targets[0];
        await putWithProgress(t.fileUrl, file, "application/pdf", (p) =>
          update(item.tempId, { progress: p }),
        );
        update(item.tempId, {
          status: "done",
          meta: { kind: "pdf", file_key: t.fileKey, file_name: file.name, size_bytes: file.size },
        });
        return;
      }

      update(item.tempId, { status: "converting" });
      const { full, thumb } = await resizeForUpload(file);
      const preview = URL.createObjectURL(thumb.blob);
      previews.current.push(preview);
      update(item.tempId, { status: "uploading", preview });

      const res = await createAttachmentUploadAction({
        category,
        files: [{ kind: "image", size: full.blob.size }],
      });
      if (!res.ok) throw new Error(res.error);
      const t = res.targets[0];
      if (t.kind !== "image") throw new Error("잘못된 응답입니다.");
      await putWithProgress(t.thumbUrl, thumb.blob, "image/jpeg", () => {});
      await putWithProgress(t.fileUrl, full.blob, "image/jpeg", (p) =>
        update(item.tempId, { progress: p }),
      );
      update(item.tempId, {
        status: "done",
        meta: {
          kind: "image",
          file_key: t.fileKey,
          thumb_key: t.thumbKey,
          width: full.width,
          height: full.height,
          file_name: file.name,
          size_bytes: full.blob.size,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error && !err.message.startsWith("업로드")
          ? err.message
          : "업로드에 실패했습니다.";
      update(item.tempId, { status: "error", error: message });
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;
    setError(null);

    const accepted = files.filter((f) => mode === "images+pdf" || !isPdf(f));
    if (accepted.length < files.length) setError("PDF는 올릴 수 없습니다. 사진만 골라주세요.");

    const queued = accepted.map((file) => ({
      file,
      item: {
        tempId: crypto.randomUUID(),
        kind: isPdf(file) ? "pdf" : "image",
        name: file.name,
        preview: null,
        status: "waiting",
        progress: 0,
      } as NewItem,
    }));
    setItems((prev) => [...prev, ...queued.map((q) => q.item)]);

    // 동시에 몇 개씩만 처리해 휴대폰 메모리와 회선을 아낀다.
    let next = 0;
    const worker = async () => {
      while (next < queued.length) {
        const { item, file } = queued[next++];
        await uploadOne(item, file);
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queued.length) }, worker));
  }

  const visibleExisting = existing.filter((a) => !removed.includes(a.id));
  const done = items.filter((i) => i.status === "done");
  const failed = items.filter((i) => i.status === "error").length;
  const label = mode === "images" ? "사진" : "주보 파일 (사진 또는 PDF)";

  return (
    <div>
      <label htmlFor="attachments-input" className="block text-sm text-[#404040] mb-2">
        {label}
      </label>
      <input
        id="attachments-input"
        type="file"
        multiple
        accept={mode === "images" ? "image/*" : "image/*,application/pdf,.pdf"}
        onChange={handleChange}
        className="block w-full text-sm text-[#404040] file:mr-4 file:px-4 file:py-2.5 file:rounded-lg file:border-0 file:bg-gray-100 file:text-[#404040] hover:file:bg-gray-200"
      />
      <input
        type="hidden"
        name="attachments"
        value={JSON.stringify(done.map((i) => i.meta))}
      />
      <input type="hidden" name="remove_attachments" value={JSON.stringify(removed)} />

      <p className="mt-2 text-xs text-[#999]">
        {mode === "images"
          ? "여러 장을 한 번에 고를 수 있습니다. 사진은 올리기 전에 알맞은 크기로 줄여집니다."
          : "주보 사진 여러 장이나 PDF를 고르세요. 사진은 올리기 전에 알맞은 크기로 줄여집니다."}
        {(visibleExisting.length > 0 || items.length > 0) &&
          ` 지금 ${visibleExisting.length + done.length}개${busy ? ", 올리는 중" : ""}${failed ? `, 실패 ${failed}개` : ""}.`}
      </p>

      {(visibleExisting.length > 0 || items.length > 0) && (
        <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {visibleExisting.map((a) => (
            <li key={a.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {a.kind === "image" && a.thumbUrl ? (
                // R2 서명 주소라 next/image 최적화 대상이 아니다.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.thumbUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <PdfTile name={a.fileName} />
              )}
              <button
                type="button"
                onClick={() => setRemoved((r) => [...r, a.id])}
                aria-label="이 파일 빼기"
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm leading-none"
              >
                ×
              </button>
            </li>
          ))}
          {items.map((i) => (
            <li key={i.tempId} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {i.kind === "image" && i.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.preview} alt="" className="w-full h-full object-cover" />
              ) : i.kind === "pdf" ? (
                <PdfTile name={i.name} />
              ) : null}
              {i.status !== "done" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-[#404040] text-center px-1">
                  {i.status === "error"
                    ? i.error
                    : i.status === "uploading"
                      ? `${i.progress}%`
                      : i.status === "converting"
                        ? "줄이는 중"
                        : "대기"}
                </div>
              )}
              {(i.status === "done" || i.status === "error") && (
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((x) => x.tempId !== i.tempId))}
                  aria-label="이 파일 빼기"
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm leading-none"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function PdfTile({ name }: { name: string | null }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center">
      <span className="text-xs font-medium text-red-600">PDF</span>
      <span className="text-[11px] text-[#666] break-all line-clamp-3">{name}</span>
    </div>
  );
}
