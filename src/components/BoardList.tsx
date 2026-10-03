// 목회편지·매일의 묵상·공지사항 등 관리자 게시판의 글 목록 화면
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { getPostsByCategory } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import type { Board } from "@/lib/boards";

export function AdminPencil({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Link
      href={isAdmin ? "/admin" : "/admin/login"}
      aria-label={isAdmin ? "관리" : "관리자 로그인"}
      className="text-line hover:text-mute transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    </Link>
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
      <main>
        <PageHeader path={board.path} />

        <section className="shell pb-20 md:pb-28">
          <div className="flex items-center justify-between pb-4">
            <p className="text-sm text-mute">
              전체 <span className="font-semibold text-ink">{posts.length}</span>개
            </p>
            <AdminPencil isAdmin={isAdmin} />
          </div>

          {posts.length === 0 ? (
            <p className="border-t-2 border-ink py-24 text-center text-mute">
              아직 등록된 {board.label} 글이 없습니다.
            </p>
          ) : (
            <ul className="border-t-2 border-ink">
              {posts.map((post) => (
                <li key={post.id} className="border-b border-line">
                  <Link
                    href={`${board.path}/${post.id}`}
                    className="group flex items-center gap-4 px-1 md:px-4 py-5 md:py-6 hover:bg-paper transition-colors"
                  >
                    {post.audio_key && (
                      <span className="shrink-0 rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-forest">
                        녹음
                      </span>
                    )}
                    <h2 className="flex-1 min-w-0 truncate text-base md:text-lg font-medium text-ink group-hover:text-forest transition-colors">
                      {post.title}
                    </h2>
                    <span className="shrink-0 text-sm text-mute">{formatPostDate(post.post_date)}</span>
                    <span aria-hidden="true" className="hidden md:block text-mute group-hover:text-forest">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
