"use client";
// 메인 화면의 최근 주일설교 칸. 유튜브 차단을 피한 기존 /api/youtube(Edge, 1시간 캐시)를 브라우저에서 불러
// 가장 최근 주일설교 하나를 보여 주고, 누르면 그 자리에서 재생한다.

import { useEffect, useState } from "react";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  published: string;
  category: "sunday" | "wednesday" | "live" | null;
}

// "2026-09-27 l 다윗과 아비가일 l 서문동수 목사 l 드림숲교회 주일설교" 형식을 나눈다. 형식이 다르면 제목 그대로.
function parseSermonTitle(raw: string) {
  const parts = raw.split(/\s+l\s+/).map((p) => p.trim());
  if (parts.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
    return { date: parts[0].replaceAll("-", "."), title: parts[1], preacher: parts[2] };
  }
  return { date: null, title: raw, preacher: null };
}

export default function HomeLatestSermon() {
  const [video, setVideo] = useState<Video | null | undefined>(undefined); // undefined = 불러오는 중
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((data: Video[]) => setVideo(data.find((v) => v.category === "sunday") ?? null))
      .catch(() => setVideo(null));
  }, []);

  if (video === null) return null; // 못 불러오면 칸을 숨긴다.

  const info = video ? parseSermonTitle(video.title) : null;

  return (
    <section className="pt-16 md:pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-[#2c2c2c]/80">
          <h2 className="text-xl md:text-2xl font-light text-[#2c2c2c]">주일설교</h2>
          <Link href="/media" className="text-sm text-[#999] hover:text-[#2c2c2c] transition-colors">
            설교말씀 더 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 md:gap-10 items-center">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            {video && playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                title={info?.title ?? "주일설교"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : video ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 w-full h-full"
                aria-label={`${info?.title} 재생`}
              >
                {/* 4:3 썸네일의 위아래 검은 띠를 잘라 16:9로 보이게 한다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                  <span className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </button>
            ) : null}
          </div>

          <div className="min-h-[6rem]">
            {info && (
              <>
                <p className="text-sm text-[#999]">{info.date ?? "최근 주일설교"}</p>
                <h3 className="mt-2 text-2xl md:text-3xl font-light text-[#2c2c2c] leading-snug">
                  {info.title}
                </h3>
                {info.preacher && <p className="mt-3 text-base text-[#666]">{info.preacher}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
