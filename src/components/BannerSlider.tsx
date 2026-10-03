"use client";
// 메인 첫 화면 왼쪽 행사 배너. 여러 장이면 자동으로 넘기고 이전·정지·다음 버튼과 순번을 보여 준다.
// 포스터가 잘리지 않게 전체를 보이고 같은 사진을 흐리게 깔아 빈 곳을 채운다. 배너가 없으면 교회 사진을 넘겨 보여 준다.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

const FALLBACK_PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `/images/hero-${n}.jpg`);
const INTERVAL_MS = 6000;

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function BannerLink({ item, children }: { item: BannerItem; children: React.ReactNode }) {
  if (!item.linkUrl) return <>{children}</>;
  const className = "absolute inset-0";
  return item.linkUrl.startsWith("/") ? (
    <Link href={item.linkUrl} className={className} aria-label={item.title}>
      {children}
    </Link>
  ) : (
    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className={className} aria-label={item.title}>
      {children}
    </a>
  );
}

export default function BannerSlider({ items }: { items: BannerItem[] }) {
  const usingFallback = items.length === 0;
  const count = usingFallback ? FALLBACK_PHOTOS.length : items.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const move = useCallback((d: number) => setCurrent((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => move(1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, count, move, current]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#2c2c2c]">
      {usingFallback
        ? FALLBACK_PHOTOS.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ${i === current ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundImage: `url(${src})` }}
              aria-hidden={i !== current}
            />
          ))
        : items.map((item, i) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-[1]" : "opacity-0 pointer-events-none"}`}
              aria-hidden={i !== current}
            >
              {/* 같은 사진을 흐리게 깔아 포스터 양옆·위아래 빈 곳을 채운다. */}
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl opacity-70"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <BannerLink item={item}>
                {/* 캐시되는 메인이라 서명 주소 대신 고정 주소(/r2/…)를 쓴다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="relative w-full h-full object-contain"
                />
              </BannerLink>
            </div>
          ))}

      {count > 1 && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-white text-xs">
          <button type="button" onClick={() => move(-1)} aria-label="이전 배너" className="w-7 h-7 flex items-center justify-center hover:text-white/70">
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "자동 넘김 다시 시작" : "자동 넘김 멈추기"}
            className="w-7 h-7 flex items-center justify-center hover:text-white/70"
          >
            {paused ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            )}
          </button>
          <button type="button" onClick={() => move(1)} aria-label="다음 배너" className="w-7 h-7 flex items-center justify-center hover:text-white/70">
            <Arrow dir="right" />
          </button>
          <span className="px-1.5 tabular-nums">
            {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
