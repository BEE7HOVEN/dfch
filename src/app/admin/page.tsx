import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { requireAuth } from "@/lib/auth";
import { getAllPosts } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { logoutAction } from "./actions";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAuth();
  const posts = await getAllPosts();

  return (
    <>
      <Header />
      <main className="pt-16 min-h-[60vh]">
        <Hero image="/images/hero-5.jpg" title="목회편지" />
        <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-light text-[#2c2c2c]">글 관리</h2>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-[#666] hover:text-[#2c2c2c] transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>

          <div className="mb-6">
            <Link
              href="/admin/new"
              className="inline-block px-5 py-3 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#404040] transition-colors"
            >
              + 새 목회편지 쓰기
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {posts.length === 0 ? (
              <p className="px-6 py-12 text-center text-[#999]">
                아직 작성된 글이 없습니다.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-6 py-4 gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-[#2c2c2c] truncate">{post.title}</p>
                    <p className="text-xs text-[#999] mt-1">
                      {formatPostDate(post.post_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="text-sm text-[#404040] hover:text-[#2c2c2c] transition-colors"
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
