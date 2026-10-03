// 목회편지·매일의 묵상 등 관리자 게시판의 글 본문 화면
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { getPost } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import type { Board } from "@/lib/boards";
import { createDownloadUrl } from "@/lib/r2";

export default async function BoardDetail({
  board,
  id,
}: {
  board: Board;
  id: string;
}) {
  const [post, isAdmin] = await Promise.all([getPost(id), isAuthenticated()]);
  if (!post || post.category !== board.category) notFound();

  // 녹음은 비공개 버킷에 있으므로 볼 때마다 몇 시간짜리 재생 주소를 만든다.
  let audioUrl: string | null = null;
  if (post.audio_key) {
    try {
      audioUrl = await createDownloadUrl(post.audio_key);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero
          image={board.heroImage}
          title={post.title}
          subtitle={formatPostDate(post.post_date)}
        />

        <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          {isAdmin && (
            <div className="flex justify-end mb-6">
              <Link
                href={`/admin/edit/${post.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#2c2c2c] transition-colors"
              >
                <svg
                  className="w-4 h-4"
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
                수정
              </Link>
            </div>
          )}

          {post.audio_key &&
            (audioUrl ? (
              <audio
                controls
                preload="metadata"
                src={audioUrl}
                className="w-full mb-10"
              />
            ) : (
              <p className="mb-10 text-sm text-[#999]">
                녹음을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            ))}

          {post.content && (
            <div className="whitespace-pre-wrap leading-[2] text-base md:text-lg text-[#404040]">
              {post.content}
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-gray-100 text-center">
            <Link
              href={board.path}
              className="text-sm text-[#666] hover:text-[#2c2c2c] transition-colors"
            >
              ← 목록으로
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
