"use client";
// 메인 첫 화면 오른쪽 주일설교 카드. 유튜브 차단을 피한 기존 /api/youtube(Edge, 1시간 캐시)를 브라우저에서 불러
// 가장 최근 주일설교를 보여 주고, 누르면 그 자리에서 재생한다. 아래에 매일의 묵상·예배 안내 바로가기를 둔다.

import { useEffect, useState } from "react";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
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

export default function SermonCard() {
  const [video, setVideo] = useState<Video | null | undefined>(undefined); // undefined = 불러오는 중
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((data: Video[]) => setVideo(data.find((v) => v.category === "sunday") ?? null))
      .catch(() => setVideo(null));
  }, []);

  const info = video ? parseSermonTitle(video.title) : null;

  return (
    <div className="h-full rounded-2xl bg-[#2c2c2c] text-white p-5 md:p-6 flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-white/50">SUNDAY MESSAGE</p>
          <h2 className="mt-1 text-xl font-light">주일설교</h2>
        </div>
        <Link
          href="/media"
          aria-label="설교말씀 더 보기"
          className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
          </svg>
        </Link>
      </div>

      <div className="relative mt-4 aspect-video rounded-xl overflow-hidden bg-white/10">
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
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
              <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-[#2c2c2c] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        ) : video === null ? (
          <Link href="/media" className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
            설교 영상 보러 가기 →
          </Link>
        ) : null}
      </div>

      <div className="mt-4 min-h-[4.5rem]">
        {info && (
          <>
            <h3 className="text-lg md:text-xl leading-snug line-clamp-2">{info.title}</h3>
            <p className="mt-1.5 text-sm text-white/60">
              {[info.preacher, info.date].filter(Boolean).join(" · ")}
            </p>
          </>
        )}
      </div>

      <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
        <Link
          href="/meditation"
          className="rounded-xl border border-white/15 px-3 py-3 hover:bg-white/10 transition-colors"
        >
          <span className="block text-[11px] text-white/50">매일 아침</span>
          <span className="block text-sm mt-0.5">매일의 묵상</span>
        </Link>
        <Link
          href="/service"
          className="rounded-xl border border-white/15 px-3 py-3 hover:bg-white/10 transition-colors"
        >
          <span className="block text-[11px] text-white/50">처음 오셨나요?</span>
          <span className="block text-sm mt-0.5">예배 안내</span>
        </Link>
      </div>
    </div>
  );
}
