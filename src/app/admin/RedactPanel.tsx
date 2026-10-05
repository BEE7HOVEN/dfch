"use client";
// 주보 PDF를 올릴 때 1쪽 위에 가릴 네모를 보여 주고, 끌어서 옮기거나 오른쪽 아래 모서리로 크기를 바꾼 뒤 확인받는 창.

import { useRef, useState } from "react";
import { DEFAULT_BOX, type Box } from "./redact";

const MIN = 0.03; // 네모의 가장 작은 폭·높이 (쪽 비율)

export default function RedactPanel({
  imageUrl,
  initialBox,
  onConfirm,
  onSkip,
}: {
  imageUrl: string;
  initialBox: Box;
  onConfirm: (box: Box) => void;
  onSkip: () => void;
}) {
  const [box, setBox] = useState<Box>(initialBox);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "move" | "resize"; x: number; y: number; start: Box } | null>(null);

  const begin = (mode: "move" | "resize", e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // 네모 밖으로 손가락·마우스가 나가도 계속 따라오게 붙잡는다. 못 붙잡아도 끌기는 된다.
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    drag.current = { mode, x: e.clientX, y: e.clientY, start: box };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    const area = areaRef.current?.getBoundingClientRect();
    if (!d || !area) return;
    const dx = (e.clientX - d.x) / area.width;
    const dy = (e.clientY - d.y) / area.height;
    const [x0, y0, x1, y1] = d.start;
    if (d.mode === "move") {
      const w = x1 - x0, h = y1 - y0;
      const nx = Math.min(Math.max(0, x0 + dx), 1 - w);
      const ny = Math.min(Math.max(0, y0 + dy), 1 - h);
      setBox([nx, ny, nx + w, ny + h]);
    } else {
      setBox([x0, y0, Math.min(1, Math.max(x0 + MIN, x1 + dx)), Math.min(1, Math.max(y0 + MIN, y1 + dy))]);
    }
  };
  const end = () => {
    drag.current = null;
  };

  const [x0, y0, x1, y1] = box;
  return (
    <div className="mt-3 rounded-xl border-2 border-forest/40 bg-mist p-4">
      <p className="text-sm font-semibold text-ink">1쪽에서 가릴 곳을 확인해 주세요</p>
      <p className="mt-1 text-xs text-sub">
        하얀 네모 안(헌금자 명단 등)은 지워져서 홈페이지와 PDF 저장 파일 어디에도 남지 않습니다. 네모를 끌어 옮기거나 오른쪽 아래 모서리로 크기를
        바꿀 수 있고, 바꾼 위치는 다음 주에도 기억합니다.
      </p>
      <div
        ref={areaRef}
        className="relative mt-3 select-none touch-none"
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        {/* 브라우저에서 만든 미리보기 주소라 next/image 대상이 아니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="주보 1쪽 미리보기" draggable={false} className="block w-full h-auto rounded-md border border-line bg-white" />
        <div
          role="presentation"
          onPointerDown={(e) => begin("move", e)}
          className="absolute cursor-move bg-white/85 outline-2 outline-dashed outline-red-500"
          style={{ left: `${x0 * 100}%`, top: `${y0 * 100}%`, width: `${(x1 - x0) * 100}%`, height: `${(y1 - y0) * 100}%` }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-red-600">가릴 곳</span>
          <span
            onPointerDown={(e) => begin("resize", e)}
            aria-label="크기 바꾸기"
            className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-red-500 border-2 border-white cursor-nwse-resize"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onConfirm(box)}
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
        >
          가리고 올리기
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-sub hover:border-forest hover:text-forest"
        >
          가리지 않고 올리기
        </button>
        <button type="button" onClick={() => setBox(DEFAULT_BOX)} className="ml-auto text-xs text-mute underline underline-offset-2 hover:text-forest">
          처음 위치로
        </button>
      </div>
    </div>
  );
}
