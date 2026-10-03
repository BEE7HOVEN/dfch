"use client";
// 주보 넘겨 보기: 쪽을 옆으로 밀어 넘기고(휴대폰은 손가락으로), 확대·축소·전체화면·PDF 저장을 둔다. 사진 없이 PDF만 있으면 PDF를 그대로 띄운다.

import { useCallback, useEffect, useRef, useState } from "react";

export interface BulletinPage {
  url: string;
  thumbUrl: string | null;
  width: number | null;
  height: number | null;
}

const ZOOMS = [1, 1.5, 2, 3];
const SWIPE_PX = 50;

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-10 h-10 rounded-full flex items-center justify-center text-sub hover:bg-mist hover:text-forest disabled:text-line disabled:hover:bg-transparent transition-colors"
    >
      {children}
    </button>
  );
}

const icon = "w-5 h-5";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export default function BulletinViewer({
  title,
  pages,
  pdfUrl,
  pdfDownloadUrl,
}: {
  title: string;
  pages: BulletinPage[];
  pdfUrl: string | null;
  pdfDownloadUrl: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(0); // ZOOMS의 순번 (0 = 화면에 맞춤)
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = pages.length;

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= count) return;
      setIndex(next);
      setZoom(0);
    },
    [count],
  );

  // 키보드 ←·→ 로도 넘긴다 (입력칸에 있을 때는 제외).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // 아이폰처럼 요소 전체화면이 안 되는 브라우저에서는 전체화면 단추를 숨긴다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 기능 확인은 화면에 붙은 뒤에만 할 수 있다.
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen();
  };

  // 사진 없이 PDF만 올린 주보
  if (count === 0) {
    if (!pdfUrl) return null;
    return (
      <div className="rounded-[20px] border border-line overflow-hidden">
        <iframe src={pdfUrl} title={title} className="hidden md:block w-full h-[80vh] bg-paper" />
        <div className="flex flex-wrap items-center justify-center gap-3 p-5 bg-paper">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            PDF 열기
          </a>
          {pdfDownloadUrl && (
            <a
              href={pdfDownloadUrl}
              className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-sub hover:border-forest hover:text-forest"
            >
              PDF 저장
            </a>
          )}
        </div>
      </div>
    );
  }

  const scale = ZOOMS[zoom];
  const zoomed = scale > 1;
  // 휴대폰에서는 화면 높이를 첫 쪽 비율에 맞춰 빈 공간을 없앤다 (가로 주보·세로 주보 모두). 모르면 A4 세로.
  const first = pages[0];
  const ratio = first.width && first.height ? first.width / first.height : 1 / Math.SQRT2;

  return (
    <div
      ref={rootRef}
      className={`flex flex-col bg-paper ${fullscreen ? "h-screen" : "rounded-[20px] border border-line overflow-hidden"}`}
    >
      {/* 도구 띠 */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 md:px-5 py-2 bg-white border-b border-line">
        <div className="flex items-center gap-1">
          <ToolButton label="이전 쪽" onClick={() => go(index - 1)} disabled={index === 0}>
            <svg className={icon} viewBox="0 0 24 24" {...stroke}><path d="m15 18-6-6 6-6" /></svg>
          </ToolButton>
          <span className="min-w-[56px] text-center text-sm tabular-nums text-ink" aria-live="polite">
            <b className="font-semibold">{index + 1}</b> <span className="text-mute">/ {count}</span>
          </span>
          <ToolButton label="다음 쪽" onClick={() => go(index + 1)} disabled={index === count - 1}>
            <svg className={icon} viewBox="0 0 24 24" {...stroke}><path d="m9 18 6-6-6-6" /></svg>
          </ToolButton>
        </div>

        <div className="flex items-center gap-1">
          <ToolButton label="축소" onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0}>
            <svg className={icon} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7" /><path d="M8 11h6M21 21l-4.3-4.3" /></svg>
          </ToolButton>
          <span className="hidden sm:inline min-w-[48px] text-center text-sm tabular-nums text-sub">{Math.round(scale * 100)}%</span>
          <ToolButton label="확대" onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoom === ZOOMS.length - 1}>
            <svg className={icon} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7" /><path d="M8 11h6M11 8v6M21 21l-4.3-4.3" /></svg>
          </ToolButton>
          <ToolButton label="화면에 맞춤" onClick={() => setZoom(0)} disabled={!zoomed}>
            <svg className={icon} viewBox="0 0 24 24" {...stroke}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </ToolButton>
          {canFullscreen && (
            <ToolButton label={fullscreen ? "전체화면 닫기" : "전체화면"} onClick={toggleFullscreen}>
              {fullscreen ? (
                <svg className={icon} viewBox="0 0 24 24" {...stroke}><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
              ) : (
                <svg className={icon} viewBox="0 0 24 24" {...stroke}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /><path d="M9 9h6v6H9z" /></svg>
              )}
            </ToolButton>
          )}
          {pdfDownloadUrl && (
            <a
              href={pdfDownloadUrl}
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-sub hover:border-forest hover:text-forest transition-colors"
            >
              PDF 저장
            </a>
          )}
        </div>
      </div>

      {/* 쪽 화면: 맞춤일 때는 쪽들을 옆으로 이어 붙여 밀어 넘기고, 확대하면 지금 쪽만 크게 띄워 스크롤한다. */}
      <div
        className={`relative ${fullscreen ? "flex-1 min-h-0" : "aspect-(--page-ratio) max-h-[80vh] md:aspect-auto md:h-[78vh] md:min-h-[460px] md:max-h-[1200px]"}`}
        style={{ "--page-ratio": String(ratio) } as React.CSSProperties}
        onTouchStart={(e) => {
          // 손가락 하나로 밀 때만 넘긴다 (두 손가락은 확대).
          touchX.current = zoomed || e.touches.length > 1 ? null : e.touches[0].clientX;
        }}
        onTouchMove={(e) => {
          if (e.touches.length > 1) touchX.current = null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (dx <= -SWIPE_PX) go(index + 1);
          if (dx >= SWIPE_PX) go(index - 1);
        }}
      >
        {zoomed ? (
          <div className="absolute inset-0 overflow-auto flex">
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 서명 주소라 next/image 최적화를 쓰지 않는다. */}
            <img
              src={pages[index].url}
              alt={`${title} ${index + 1}쪽`}
              style={{ height: `${scale * 100}%` }}
              className="m-auto max-w-none w-auto p-4 md:p-6"
            />
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {pages.map((p, i) => (
                <div key={p.url} className="w-full h-full shrink-0 flex items-center justify-center p-2 md:p-6" aria-hidden={i !== index}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- R2 서명 주소라 next/image 최적화를 쓰지 않는다. */}
                  <img
                    src={p.url}
                    alt={`${title} ${i + 1}쪽`}
                    width={p.width ?? undefined}
                    height={p.height ?? undefined}
                    loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                    className="max-w-full max-h-full w-auto h-auto object-contain bg-white shadow-[0_8px_28px_rgba(31,36,33,0.12)]"
                  />
                </div>
              ))}
            </div>

            {/* PC에서 화면 양옆을 눌러도 넘긴다. */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="이전 쪽"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow items-center justify-center text-ink hover:text-forest"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" {...stroke}><path d="m15 18-6-6 6-6" /></svg>
              </button>
            )}
            {index < count - 1 && (
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="다음 쪽"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow items-center justify-center text-ink hover:text-forest"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" {...stroke}><path d="m9 18 6-6-6-6" /></svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 쪽 미리보기 줄 */}
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 md:px-5 py-3 bg-white border-t border-line">
          {pages.map((p, i) => (
            <button
              key={p.url}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1}쪽으로`}
              aria-current={i === index ? "page" : undefined}
              style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : "3 / 4" }}
              className={`relative shrink-0 h-16 md:h-[72px] overflow-hidden rounded-md border-2 transition-colors ${
                i === index ? "border-forest" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- R2 서명 주소라 next/image 최적화를 쓰지 않는다. */}
              <img src={p.thumbUrl ?? p.url} alt="" loading="lazy" className="w-full h-full object-cover object-top bg-paper" />
              <span className="absolute bottom-0 inset-x-0 bg-black/45 text-[10px] text-white text-center">{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
