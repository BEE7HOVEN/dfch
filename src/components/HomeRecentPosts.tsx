// 메인 화면의 최근 공지사항·매일의 묵상 두 칸 (글 4개씩, 더보기 링크)
import Link from "next/link";
import { boards, type Board } from "@/lib/boards";
import { getRecentPosts, type Post } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";

const LIMIT = 4;

// DB를 못 읽어도 메인 화면 전체가 깨지지 않게 빈 목록으로 둔다.
async function safeRecent(board: Board): Promise<Post[]> {
  try {
    return await getRecentPosts(board.category, LIMIT);
  } catch (e) {
    console.error(e);
    return [];
  }
}

function Column({ board, posts, empty }: { board: Board; posts: Post[]; empty: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[#2c2c2c]/80">
        <h2 className="text-xl md:text-2xl font-light text-[#2c2c2c]">{board.label}</h2>
        <Link
          href={board.path}
          className="text-sm text-[#999] hover:text-[#2c2c2c] transition-colors"
        >
          더보기 →
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#999]">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`${board.path}/${post.id}`}
                className="flex items-center justify-between gap-4 py-3.5 group"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {post.audio_key && (
                    <svg
                      className="w-4 h-4 shrink-0 text-[#999]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                      aria-label="녹음 있음"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                      />
                    </svg>
                  )}
                  <span className="text-[15px] md:text-base text-[#404040] group-hover:text-[#2c2c2c] truncate">
                    {post.title}
                  </span>
                </span>
                <span className="shrink-0 text-xs md:text-sm text-[#999]">
                  {formatPostDate(post.post_date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function HomeRecentPosts() {
  const [notices, meditations] = await Promise.all([
    safeRecent(boards.notice),
    safeRecent(boards.meditation),
  ]);

  return (
    <section className="pt-16 md:pt-24 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <Column board={boards.notice} posts={notices} empty="아직 등록된 공지가 없습니다." />
        <Column
          board={boards.meditation}
          posts={meditations}
          empty="아직 등록된 묵상이 없습니다."
        />
      </div>
    </section>
  );
}
