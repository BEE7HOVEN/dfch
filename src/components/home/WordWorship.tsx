"use client";
// 메인 말씀과 예배: 유튜브 최신 영상 6개 카드. 유튜브 차단을 피한 /api/youtube(Edge, 1시간 캐시)를 브라우저에서 부른다.

import { useEffect, useState } from "react";
import SectionHead from "@/components/SectionHead";

interface Video {
  id: string;
  title: string;
  published: string;
  category: "sunday" | "wednesday" | "live" | null;
}

const LABELS: Record<string, string> = { sunday: "주일설교", wednesday: "수요설교", live: "예배실황" };

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

export default function WordWorship() {
  const [videos, setVideos] = useState<Video[] | null | undefined>(undefined); // undefined = 불러오는 중

  useEffect(() => {
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((data: Video[]) => setVideos(data.slice(0, 6)))
      .catch(() => setVideos(null));
  }, []);

  if (videos === null || (videos && videos.length === 0)) return null; // 못 불러오면 칸을 숨긴다.

  return (
    <section className="py-16 md:py-24">
      <div className="shell">
        <SectionHead
          eyebrow="말씀과 예배"
          title="한 절씩, 말씀 따라 걷는 길"
          href="/media"
          linkLabel="설교말씀 전체보기"
        />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {(videos ?? Array.from({ length: 6 }, () => null)).map((v, i) => (
            // 휴대폰에서는 너무 길어지지 않게 3개만 보인다.
            <li key={v?.id ?? i} className={i >= 3 ? "hidden sm:block" : undefined}>
              {v ? (
                <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-[20px] bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100">
                        <svg className="w-5 h-5 text-forest ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-forest">{(v.category && LABELS[v.category]) ?? "영상"}</p>
                  <p className="mt-1.5 text-base md:text-[17px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-forest">
                    {displayTitle(v.title)}
                  </p>
                  <p className="mt-1.5 text-[13px] text-mute">{formatDate(v.published)}</p>
                </a>
              ) : (
                <div className="aspect-video rounded-[20px] bg-paper animate-pulse" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
