import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { getAllPosts } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { boards, isBoardCategory } from "@/lib/boards";
import { logoutAction } from "./actions";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAuth();
  const posts = await getAllPosts();

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <PageHeader path="/admin" title="글 관리" />
        <section className="shell pb-20 md:pb-28">
          <div className="flex items-center justify-end mb-6">
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-sub hover:text-forest transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {Object.values(boards).map((board) => (
              <Link
                key={board.category}
                href={`/admin/new?board=${board.category}`}
                className="inline-block px-5 py-3 bg-forest text-white rounded-lg hover:bg-forest-deep transition-colors"
              >
                + {board.newLabel}
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-line divide-y divide-line">
            {posts.length === 0 ? (
              <p className="px-6 py-12 text-center text-mute">
                아직 작성된 글이 없습니다.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-6 py-4 gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-ink truncate">{post.title}</p>
                    <p className="text-xs text-mute mt-1">
                      {isBoardCategory(post.category) &&
                        `${boards[post.category].label} · `}
                      {formatPostDate(post.post_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="text-sm text-sub hover:text-forest transition-colors"
                    >
                      수정
                    </Link>
                    <DeleteButton id={post.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
