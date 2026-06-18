"use client";

import { useState } from "react";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function VideoGrid({ videos }: { videos: Video[] }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <>
      {activeVideo && (
        <div className="mb-12">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-[#404040]">
              {videos.find((v) => v.id === activeVideo)?.title}
            </h3>
            <a
              href={`https://www.youtube.com/watch?v=${activeVideo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              YouTube에서 보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`group cursor-pointer rounded-lg overflow-hidden border transition-all ${
              activeVideo === video.id
                ? "border-red-500 shadow-lg"
                : "border-gray-100 hover:shadow-md"
            }`}
            onClick={() => setActiveVideo(video.id)}
          >
            <div className="relative aspect-video">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-[#404040] line-clamp-2 leading-relaxed">
                {video.title}
              </h3>
              <p className="text-xs text-[#999] mt-2">
                {formatDate(video.published)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
