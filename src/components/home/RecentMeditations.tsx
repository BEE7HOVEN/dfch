// 메인 말씀과 예배 칸의 매일의 묵상 줄: 최근 묵상 6개를 3칸씩 넓게 (녹음이 있으면 재생 표시)
import Link from "next/link";
import { boards } from "@/lib/boards";
import { getRecentPosts, type Post } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";

const board = boards.meditation;

export default async function RecentMeditations() {
  let posts: Post[] = [];
  try {
    posts = await getRecentPosts("meditation", 6);
  } catch (e) {
    // DB를 못 읽어도 메인 화면 전체가 깨지지 않게 이 줄만 숨긴다.
    console.error(e);
  }
  if (posts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
        <h3 className="text-lg md:text-xl font-bold text-ink">{board.label}</h3>
        <Link href={board.path} className="text-sm text-mute hover:text-forest">
          {board.label} 더보기 →
        </Link>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`${board.path}/${post.id}`}
              className="group flex items-center gap-4 rounded-[20px] bg-mist px-5 py-4 md:py-5 border border-transparent hover:border-forest/30 transition-colors"
            >
              <span
                className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                  post.audio_key ? "bg-white text-forest" : "bg-white/60 text-mute"
                }`}
                aria-hidden="true"
              >
                {post.audio_key ? (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.04A8.97 8.97 0 0 0 6 3.75c-1.05 0-2.06.18-3 .51v14.25A8.99 8.99 0 0 1 6 18c2.3 0 4.4.86 6 2.29m0-14.25a8.97 8.97 0 0 1 6-2.29c1.05 0 2.06.18 3 .51v14.25A8.99 8.99 0 0 0 18 18a8.97 8.97 0 0 0-6 2.29m0-14.25v14.25" />
                  </svg>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] text-mute">
                  {formatPostDate(post.post_date)}
                  {post.audio_key && " · 녹음"}
                </span>
                <span className="mt-0.5 block truncate text-base font-semibold text-ink group-hover:text-forest">{post.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
