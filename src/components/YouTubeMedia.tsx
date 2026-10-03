"use client";
// 설교말씀 영상 목록: 탭별 12개씩 쪽 번호로 넘기고, 누른 영상은 목록 위에서 바로 재생한다.

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { YOUTUBE_URL } from "@/lib/site";
import { TABS, type VideoCategory } from "@/lib/sermonTabs";

interface Video {
  id: string;
  title: string;
  published: string;
  category: VideoCategory | null;
  thumbnail: string;
}

const PER_PAGE = 12;
// 쪽 번호는 지금 쪽을 가운데 두고 최대 5개만 보인다.
const PAGE_WINDOW = 5;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const href = (tab: VideoCategory, page = 1) => (page > 1 ? `/media?tab=${tab}&page=${page}` : `/media?tab=${tab}`);

function Pagination({ tab, page, total }: { tab: VideoCategory; page: number; total: number }) {
  if (total <= 1) return null;
  const start = Math.max(1, Math.min(page - Math.floor(PAGE_WINDOW / 2), total - PAGE_WINDOW + 1));
  const pages = Array.from({ length: Math.min(PAGE_WINDOW, total) }, (_, i) => start + i);
  const arrow = "w-10 h-10 rounded-full flex items-center justify-center text-sub hover:bg-mist hover:text-forest";
  const off = "w-10 h-10 rounded-full flex items-center justify-center text-line";

  return (
    <nav aria-label="쪽 이동" className="mt-14 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(tab, 1)} className={arrow} aria-label="처음 쪽">«</Link>
      ) : (
        <span className={off} aria-hidden="true">«</span>
      )}
      {page > 1 ? (
        <Link href={href(tab, page - 1)} className={arrow} aria-label="이전 쪽">‹</Link>
      ) : (
        <span className={off} aria-hidden="true">‹</span>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(tab, p)}
          aria-current={p === page ? "page" : undefined}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] transition-colors ${
            p === page ? "bg-forest text-white font-semibold" : "text-sub hover:bg-mist hover:text-forest"
          }`}
        >
          {p}
        </Link>
      ))}
      {page < total ? (
        <Link href={href(tab, page + 1)} className={arrow} aria-label="다음 쪽">›</Link>
      ) : (
        <span className={off} aria-hidden="true">›</span>
      )}
      {page < total ? (
        <Link href={href(tab, total)} className={arrow} aria-label="마지막 쪽">»</Link>
      ) : (
        <span className={off} aria-hidden="true">»</span>
      )}
    </nav>
  );
}

export default function YouTubeMedia({ tab, page }: { tab: VideoCategory; page: number }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  // 재생 중인 영상은 그 영상을 누른 탭·쪽에서만 보인다 (다른 쪽으로 넘기면 닫힘).
  const [active, setActive] = useState<{ id: string; at: string } | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const at = `${tab}-${page}`;
  const activeVideo = active?.at === at ? videos.find((v) => v.id === active.id) : undefined;

  const tabVideos = videos.filter((v) => v.category === tab);
  const totalPages = Math.max(1, Math.ceil(tabVideos.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageVideos = tabVideos.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  useEffect(() => {
    fetch(`/api/youtube`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeVideo) playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeVideo]);

  return (
    <section className="shell pb-20 md:pb-28">
      <div className="flex items-end justify-between border-b border-line">
        <div className="flex gap-6 md:gap-10" role="tablist">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={href(t.key)}
              role="tab"
              aria-selected={tab === t.key}
              scroll={false}
              className={`pb-3 -mb-px border-b-[3px] text-[17px] md:text-lg font-semibold transition-colors ${
                tab === t.key ? "border-forest text-forest" : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        {!loading && tabVideos.length > 0 && (
          <p className="pb-3 text-sm text-mute">
            전체 <span className="font-semibold text-ink">{tabVideos.length}</span>개
          </p>
        )}
      </div>

      {activeVideo && (
        <div ref={playerRef} className="mt-10">
          <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg md:text-xl font-bold text-ink">{activeVideo.title}</h3>
            <a
              href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-sub hover:text-forest"
            >
              유튜브에서 보기 ↗
            </a>
          </div>
        </div>
      )}

      <div className="mt-10">
        {loading ? (
          <p className="text-center py-24 text-mute">영상을 불러오는 중...</p>
        ) : videos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-mute mb-4">영상을 불러올 수 없습니다.</p>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-4">
              유튜브 채널에서 직접 보기
            </a>
          </div>
        ) : pageVideos.length === 0 ? (
          <p className="text-center py-24 text-mute">올라온 영상이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {pageVideos.map((video) => (
              <li key={video.id}>
                <button type="button" onClick={() => setActive({ id: video.id, at })} className="group block w-full text-left">
                  <div
                    className={`relative aspect-video rounded-[16px] overflow-hidden bg-paper ring-2 transition ${
                      activeVideo?.id === video.id ? "ring-forest" : "ring-transparent"
                    }`}
                  >
                    <Image
                      src={video.thumbnail}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-forest ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-forest transition-colors">
                    {video.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-mute">{formatDate(video.published)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && <Pagination tab={tab} page={current} total={totalPages} />}
    </section>
  );
}
