"use client";
// 교회 건물 사진 슬라이드. 화면 폭 전체로 넘어가며, children을 주면 사진 위에 얹어 보여 준다(메인 맨 위 교회 소개 칸).
// 사진 9장(약 5.5MB)을 한꺼번에 받지 않도록 지금 장과 다음 장만 먼저 받고, 넘어갈 때마다 한 장씩 더 받는다.

import { useState, useEffect, useCallback } from "react";

const slides = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
  "/images/hero-5.jpg",
  "/images/hero-6.jpg",
  "/images/hero-7.jpg",
  "/images/hero-8.jpg",
  "/images/hero-9.jpg",
];

export default function HeroSlideshow({
  className = "relative h-[56vh] md:h-[78vh] w-full overflow-hidden",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  // 이 순번까지의 사진만 배경으로 건다 (지금 장 + 다음 장).
  const [reached, setReached] = useState(1);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setReached((r) => Math.min(slides.length - 1, r + 1));
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setReached(slides.length - 1); // 뒤로 가면 마지막 장으로 가므로 모두 받는다
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className={className}>
      {slides.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          style={i <= reached ? { backgroundImage: `url(${src})` } : undefined}
        />
      ))}

      {children ? (
        <>
          {/* 사진 위 글씨가 잘 읽히도록 아래·왼쪽을 어둡게 */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 via-black/35 to-black/5" />
          <div className="absolute inset-0 z-10">{children}</div>
        </>
      ) : (
        <div className="absolute inset-0 bg-black/10" />
      )}

      {/* 내용을 얹은 경우 화살표가 글자와 겹치므로 아래 점 표시만 쓴다. */}
      {!children && (
        <>
        <button
          onClick={prev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="이전"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="다음"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        </>
      )}

      <div className="absolute bottom-6 right-6 md:right-10 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setReached((r) => Math.max(r, Math.min(slides.length - 1, i + 1)));
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
