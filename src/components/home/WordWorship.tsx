"use client";
// 메인 말씀과 예배: 주일설교 3개(맨 위 카드에 나온 최신 1개 다음부터)와 최근 수요설교 3개. 유튜브 차단을 피한 /api/youtube(Edge, 1시간 캐시)를 브라우저에서 부른다.

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";

interface Video {
  id: string;
  title: string;
  published: string;
  category: "sunday" | "wednesday" | "live" | null;
}

// "2026-09-27 l 다윗과 아비가일 l 서문동수 목사 l 드림숲교회 주일설교" → 제목·설교자만
function displayTitle(raw: string) {
  const parts = raw.split(/\s+l\s+/).map((p) => p.trim());
  if (parts.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) return `${parts[1]} · ${parts[2]}`;
  return raw;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function VideoCard({ v }: { v: Video | null }) {
  if (!v) {
    return (
      <div className="flex sm:block gap-4">
        <div className="w-36 sm:w-full shrink-0 aspect-video rounded-xl sm:rounded-[20px] bg-paper animate-pulse" />
      </div>
    );
  }
  // 휴대폰은 작은 사진 + 제목 목록, PC는 큰 카드
  return (
    <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group flex sm:block gap-4 items-center">
      <div className="relative w-36 sm:w-full shrink-0 aspect-video overflow-hidden rounded-xl sm:rounded-[20px] bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <span className="absolute inset-0 hidden sm:flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100">
            <svg className="w-5 h-5 text-forest ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="min-w-0">
        <p className="sm:mt-4 text-[15px] sm:text-base md:text-[17px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-forest">
          {displayTitle(v.title)}
        </p>
        <p className="mt-1.5 text-[13px] text-mute">{formatDate(v.published)}</p>
      </div>
    </a>
  );
}

function VideoRow({ label, tab, videos }: { label: string; tab: string; videos: Video[] | undefined }) {
  if (videos && videos.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
        <h3 className="text-lg md:text-xl font-bold text-ink">{label}</h3>
        <Link href={`/media?tab=${tab}`} className="text-sm text-mute hover:text-forest">
          {label} 더보기 →
        </Link>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-x-6">
        {(videos ?? [null, null, null]).map((v, i) => (
          <li key={v?.id ?? i}>
            <VideoCard v={v} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WordWorship() {
  // undefined = 불러오는 중, null = 못 불러옴
  const [rows, setRows] = useState<{ sunday: Video[]; wednesday: Video[] } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((data: Video[]) =>
        setRows({
          // 가장 최근 주일설교는 맨 위 주일설교 카드에 있으므로 그다음 3개
          sunday: data.filter((v) => v.category === "sunday").slice(1, 4),
          wednesday: data.filter((v) => v.category === "wednesday").slice(0, 3),
        }),
      )
      .catch(() => setRows(null));
  }, []);

  if (rows === null || (rows && rows.sunday.length + rows.wednesday.length === 0)) return null; // 못 불러오면 칸을 숨긴다.

  return (
    <section className="py-16 md:py-24">
      <div className="shell">
        <SectionHead
          eyebrow="말씀과 예배"
          title="한 절씩, 말씀 따라 걷는 길"
          href="/media"
          linkLabel="설교말씀 전체보기"
        />
        <div className="space-y-12 md:space-y-14">
          <VideoRow label="주일설교" tab="sunday" videos={rows?.sunday} />
          <VideoRow label="수요설교" tab="wednesday" videos={rows?.wednesday} />
        </div>
      </div>
    </section>
  );
}
