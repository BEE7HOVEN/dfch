"use client";
// 갤러리 사진·주보 사진/PDF를 여러 개 골라 브라우저에서 줄인 뒤 R2로 직접 올리는 입력칸.
// 올린 결과는 숨은 칸(attachments)에, 지우기로 표시한 기존 첨부는 숨은 칸(remove_attachments)에 JSON으로 넘긴다.
// 사진은 끌어서 순서를 바꿀 수 있고(첫 사진이 대표/표지), 그 순서는 숨은 칸(attachment_order)으로 넘긴다.

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createAttachmentUploadAction } from "@/app/admin/actions";
import { resizeForUpload } from "./imageResize";
import { putWithProgress } from "./upload";
import { PDF_PAGE_LONG_SIDE, PDF_PAGE_QUALITY, pdfToPageImages } from "./pdfPages";
import { loadBox, pagesToPdf, redactPage, saveBox, type Box } from "./redact";
import RedactPanel from "./RedactPanel";

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

function isHwp(file: File) {
  return /\.hwpx?$/i.test(file.name);
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
  // 보이는 순서: 기존 첨부는 "e:<id>", 새로 올리는 것은 "n:<tempId>"
  const [order, setOrder] = useState<string[]>(() => existing.map((a) => `e:${a.id}`));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), // 살짝 움직여야 끌기 시작 (누름은 단추로)
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }), // 휴대폰은 잠깐 누르고 끌기 (그냥 밀면 화면 스크롤)
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [error, setError] = useState<string | null>(null);
  const [splitting, setSplitting] = useState(false); // PDF 쪽을 사진으로 바꾸는 중 (가릴 곳 확인 대기 포함)
  // 주보 PDF 1쪽에서 가릴 곳 확인을 기다리는 중이면 그 미리보기와 답을 넘길 함수
  const [redactAsk, setRedactAsk] = useState<{ url: string; box: Box; resolve: (box: Box | null) => void } | null>(null);
  const previews = useRef<string[]>([]);
  const pdfPages = useRef(new WeakSet<File>()); // PDF에서 바꾼 쪽 사진 (더 크게 올림)

  const busy = splitting || items.some((i) => ["waiting", "converting", "uploading"].includes(i.status));
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
      const { full, thumb } = await resizeForUpload(
        file,
        pdfPages.current.has(file) ? { maxSide: PDF_PAGE_LONG_SIDE, quality: PDF_PAGE_QUALITY } : undefined,
      );
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

    // 한글 파일은 브라우저가 열 수 없어 PDF로 바꿔 올리도록 안내한다.
    if (files.some(isHwp)) {
      setError("한글(HWP) 파일은 바로 올릴 수 없습니다. 한글에서 [파일] → [PDF로 저장하기]로 PDF를 만들어 올려 주세요.");
    }
    const notHwp = files.filter((f) => !isHwp(f));
    const picked = notHwp.filter((f) => mode === "images+pdf" || !isPdf(f));
    if (picked.length < notHwp.length) setError("PDF는 올릴 수 없습니다. 사진만 골라주세요.");

    // 주보 PDF는 쪽마다 사진으로 바꿔 넘겨 보기에 쓰고, 1쪽에서 가릴 곳(헌금자 명단 등)을 확인받아 하얗게 지운다.
    // 가렸으면 원본 PDF 대신 가린 쪽 사진으로 다시 만든 PDF를 저장용으로 올린다.
    const accepted: File[] = [];
    for (const file of picked) {
      if (!isPdf(file)) {
        accepted.push(file);
        continue;
      }
      setSplitting(true);
      try {
        const pages = await pdfToPageImages(file);
        let pdfFile = file;
        if (mode === "images+pdf" && pages.length > 0) {
          const url = URL.createObjectURL(pages[0]);
          previews.current.push(url);
          const box = await new Promise<Box | null>((resolve) => setRedactAsk({ url, box: loadBox(), resolve }));
          setRedactAsk(null);
          if (box) {
            saveBox(box);
            pages[0] = await redactPage(pages[0], box);
            pdfFile = await pagesToPdf(pages, file.name);
          }
        }
        pages.forEach((p) => pdfPages.current.add(p));
        accepted.push(pdfFile, ...pages);
      } catch (err) {
        console.error(err);
        setRedactAsk(null);
        accepted.push(file);
        setError("PDF 쪽을 사진으로 바꾸지 못해 PDF만 올립니다. 넘겨 보기를 쓰려면 주보 사진을 따로 올려 주세요.");
      } finally {
        setSplitting(false);
      }
    }

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
    setOrder((prev) => [...prev, ...queued.map((q) => `n:${q.item.tempId}`)]);

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

  // 보이는 칸을 순서대로 모은다.
  const existingById = new Map(existing.map((a) => [a.id, a]));
  const itemById = new Map(items.map((i) => [i.tempId, i]));
  const tiles = order.flatMap((key): Tile[] => {
    if (key.startsWith("e:")) {
      const a = existingById.get(key.slice(2));
      return a && !removed.includes(a.id) ? [{ key, kind: a.kind, image: a.thumbUrl, name: a.fileName, status: "done" }] : [];
    }
    const i = itemById.get(key.slice(2));
    return i ? [{ key, kind: i.kind, image: i.preview, name: i.name, status: i.status, progress: i.progress, error: i.error }] : [];
  });
  const firstImageKey = tiles.find((t) => t.kind === "image")?.key;

  // 서버로 넘길 순서: 기존은 id, 새로 올린 것은 R2 위치 (다 올라간 것만)
  const orderTokens = tiles.flatMap((t) => {
    if (t.key.startsWith("e:")) return [`id:${t.key.slice(2)}`];
    const meta = itemById.get(t.key.slice(2))?.meta;
    return meta && typeof meta.file_key === "string" ? [`key:${meta.file_key}`] : [];
  });

  const removeTile = (key: string) => {
    if (key.startsWith("e:")) setRemoved((r) => [...r, key.slice(2)]);
    else setItems((prev) => prev.filter((x) => x.tempId !== key.slice(2)));
    setOrder((prev) => prev.filter((k) => k !== key));
  };
  const moveToFront = (key: string) => setOrder((prev) => [key, ...prev.filter((k) => k !== key)]);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrder((prev) => arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id))));
  };

  return (
    <div>
      <label htmlFor="attachments-input" className="block text-sm text-sub mb-2">
        {label}
      </label>
      <input
        id="attachments-input"
        type="file"
        multiple
        accept={mode === "images" ? "image/*" : "image/*,application/pdf,.pdf,.hwp,.hwpx"}
        onChange={handleChange}
        className="block w-full text-sm text-sub file:mr-4 file:px-4 file:py-2.5 file:rounded-lg file:border-0 file:bg-mist file:text-forest hover:file:bg-line"
      />
      <input
        type="hidden"
        name="attachments"
        value={JSON.stringify(done.map((i) => i.meta))}
      />
      <input type="hidden" name="remove_attachments" value={JSON.stringify(removed)} />
      <input type="hidden" name="attachment_order" value={JSON.stringify(orderTokens)} />

      <p className="mt-2 text-xs text-mute">
        {mode === "images"
          ? "여러 장을 한 번에 고를 수 있습니다. 사진은 올리기 전에 알맞은 크기로 줄여집니다."
          : "주보 사진 여러 장이나 PDF를 고르세요. PDF는 쪽마다 사진으로도 바꿔 올려 넘겨 보기가 됩니다."}
        {splitting && (redactAsk ? " 아래에서 가릴 곳을 확인해 주세요." : " PDF 쪽을 사진으로 바꾸는 중...")}
        {(visibleExisting.length > 0 || items.length > 0) &&
          ` 지금 ${visibleExisting.length + done.length}개${busy ? ", 올리는 중" : ""}${failed ? `, 실패 ${failed}개` : ""}.`}
      </p>
      {redactAsk && (
        <RedactPanel
          imageUrl={redactAsk.url}
          initialBox={redactAsk.box}
          onConfirm={(box) => redactAsk.resolve(box)}
          onSkip={() => redactAsk.resolve(null)}
        />
      )}

      {tiles.length > 1 && (
        <p className="mt-1 text-xs text-forest">
          사진을 끌어서 순서를 바꿀 수 있습니다(휴대폰은 잠깐 누른 뒤 끌기). 첫 사진이 {mode === "images" ? "대표 사진" : "표지"}이 됩니다.
        </p>
      )}

      {tiles.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tiles.map((t) => t.key)} strategy={rectSortingStrategy}>
            <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {tiles.map((t, idx) => (
                <SortableTile
                  key={t.key}
                  tile={t}
                  index={idx}
                  isCover={t.key === firstImageKey}
                  coverLabel={mode === "images" ? "대표" : "표지"}
                  onRemove={() => removeTile(t.key)}
                  onMakeCover={t.kind === "image" && t.key !== firstImageKey && t.status === "done" ? () => moveToFront(t.key) : undefined}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface Tile {
  key: string;
  kind: "image" | "pdf";
  image: string | null;
  name: string | null;
  status: NewItem["status"];
  progress?: number;
  error?: string;
}

// 끌어서 옮길 수 있는 사진 한 칸. 오른쪽 위 ×는 빼기, 아래 "대표로"는 맨 앞으로 옮기기.
function SortableTile({
  tile,
  index,
  isCover,
  coverLabel,
  onRemove,
  onMakeCover,
}: {
  tile: Tile;
  index: number;
  isCover: boolean;
  coverLabel: string;
  onRemove: () => void;
  onMakeCover?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.key });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${index + 1}번째 ${tile.kind === "pdf" ? "PDF" : "사진"}${isCover ? ` (${coverLabel})` : ""}`}
      className={`relative aspect-square rounded-lg overflow-hidden bg-paper touch-manipulation cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "z-10 shadow-xl ring-2 ring-forest opacity-90" : ""
      } ${isCover ? "ring-2 ring-forest" : ""}`}
    >
      {tile.kind === "image" && tile.image ? (
        // R2 서명 주소·미리보기 주소라 next/image 최적화 대상이 아니다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tile.image} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" />
      ) : tile.kind === "pdf" ? (
        <PdfTile name={tile.name} />
      ) : null}

      <span className={`absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${isCover ? "bg-forest text-white" : "bg-black/50 text-white"}`}>
        {isCover ? coverLabel : index + 1}
      </span>

      {tile.status !== "done" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-sub text-center px-1">
          {tile.status === "error"
            ? tile.error
            : tile.status === "uploading"
              ? `${tile.progress ?? 0}%`
              : tile.status === "converting"
                ? "줄이는 중"
                : "대기"}
        </div>
      )}
      {(tile.status === "done" || tile.status === "error") && (
        <button
          type="button"
          onClick={onRemove}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="이 파일 빼기"
          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm leading-none"
        >
          ×
        </button>
      )}
      {onMakeCover && (
        <button
          type="button"
          onClick={onMakeCover}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-1 inset-x-1 rounded-md bg-white/90 py-1 text-[11px] font-semibold text-forest hover:bg-white"
        >
          {coverLabel}로
        </button>
      )}
    </li>
  );
}

function PdfTile({ name }: { name: string | null }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center">
      <span className="text-xs font-medium text-red-600">PDF</span>
      <span className="text-[11px] text-sub break-all line-clamp-3">{name}</span>
    </div>
  );
}
