import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { seoulToday } from "@/lib/format";
import { boards, isBoardCategory } from "@/lib/boards";
import { createPostAction } from "../actions";
import PostForm from "../PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  await requireAuth();
  const { board: boardParam } = await searchParams;
  const board = isBoardCategory(boardParam)
    ? boards[boardParam]
    : boards.letter;

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <PageHeader path="/admin" title="글 관리" />
        <section className="shell pb-20 md:pb-28">
          <div className="max-w-[860px]">
          <div className="mb-8">
            <Link
              href="/admin"
              className="text-sm text-mute hover:text-forest transition-colors"
            >
              ← 글 관리
            </Link>
            <h1 className="text-2xl font-bold text-ink mt-2">
              {board.newLabel}
            </h1>
          </div>

          <PostForm
            action={createPostAction}
            board={board}
            defaultDate={seoulToday()}
            submitLabel="발행하기"
          />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
