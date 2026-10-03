// 목회편지·매일의 묵상 등 관리자 게시판의 글 목록 화면
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { getPostsByCategory } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import type { Board } from "@/lib/boards";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

export default async function BoardList({ board }: { board: Board }) {
  const [posts, isAdmin] = await Promise.all([
    getPostsByCategory(board.category),
    isAuthenticated(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image={board.heroImage} title={board.label} />

        <section className="pt-8 md:pt-10 pb-20 md:pb-28 px-4">
          <div className="max-w-3xl mx-auto">
            {/* 관리자 영역 — 연필 아이콘 하나로 관리 화면 진입 */}
            <div className="flex items-center justify-end mb-4 min-h-[2rem]">
              <Link
                href={isAdmin ? "/admin" : "/admin/login"}
                aria-label={isAdmin ? "관리" : "관리자 로그인"}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
              </Link>
            </div>

            {posts.length === 0 ? (
              <p className="text-center text-[#999] py-20">
                아직 등록된 {board.label} 글이 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`${board.path}/${post.id}`}
                      className="flex items-center justify-between gap-4 py-5 group"
                    >
                      <h2 className="text-lg md:text-xl text-[#404040] group-hover:text-[#2c2c2c] transition-colors truncate min-w-0">
                        {post.title}
                      </h2>
                      <span className="shrink-0 text-sm text-[#555]">
                        {formatPostDate(post.post_date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
