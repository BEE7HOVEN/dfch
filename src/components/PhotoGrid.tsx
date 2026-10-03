"use client";
// 앨범 사진 바둑판과 크게 보기 화면. 좌우 버튼·키보드 화살표·휴대폰 밀어서 넘기기·Esc로 닫기를 지원한다.

import { useCallback, useEffect, useRef, useState } from "react";

export interface PhotoItem {
  id: string;
  thumbUrl: string;
  fileUrl: string;
  width: number | null;
  height: number | null;
}

export default function PhotoGrid({ photos, title }: { photos: PhotoItem[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // 크게 보는 동안 뒤 페이지가 스크롤되지 않게
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, move]);

  // 다음·이전 사진을 미리 받아 넘길 때 바로 보이게 한다.
  useEffect(() => {
    if (open === null || photos.length < 2) return;
    for (const d of [1, -1]) {
      const img = new Image();
      img.src = photos[(open + d + photos.length) % photos.length].fileUrl;
    }
  }, [open, photos]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <ul className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-3">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="block w-full aspect-square overflow-hidden rounded-md bg-gray-100"
              aria-label={`${title} 사진 ${i + 1} 크게 보기`}
            >
              {/* R2 서명 주소라 next/image 최적화(무료 한도 있음)를 쓰지 않는다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumbUrl}
                alt=""
                loading={i < 12 ? "eager" : "lazy"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </button>
          </li>
        ))}
      </ul>

      {current && open !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} 사진 ${open + 1} / ${photos.length}`}
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={current.fileUrl}
            alt={`${title} 사진 ${open + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 text-white/90 text-sm">
            <span>
              {open + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="w-10 h-10 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                aria-label="이전 사진"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                aria-label="다음 사진"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
