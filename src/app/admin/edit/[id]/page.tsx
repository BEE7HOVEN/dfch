import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { getAttachments, getPost } from "@/lib/posts";
import { withViewUrls } from "@/lib/attachmentUrls";
import { boards, isBoardCategory } from "@/lib/boards";
import { updatePostAction } from "../../actions";
import PostForm from "../../PostForm";
import DeleteButton from "../../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const post = await getPost(id);
  if (!post || !isBoardCategory(post.category)) notFound();
  const board = boards[post.category];
  const attachments = board.attachments
    ? await withViewUrls(await getAttachments(post.id))
    : [];

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <PageHeader path="/admin" title="글 관리" />
        <section className="shell pb-20 md:pb-28">
          <div className="max-w-[860px]">
          <div className="mb-8">
            <Link
              href={`/admin?board=${board.category}`}
              className="text-sm text-mute hover:text-forest transition-colors"
            >
              ← {board.label} 관리
            </Link>
            <h1 className="text-2xl font-bold text-ink mt-2">글 수정</h1>
          </div>

          <PostForm
            action={updatePostAction}
            board={board}
            post={post}
            existingAttachments={attachments.map((a) => ({
              id: a.id,
              kind: a.kind,
              thumbUrl: a.thumbUrl,
              fileName: a.file_name,
            }))}
            defaultDate={post.post_date}
            submitLabel="수정 저장"
          />

          <div className="mt-10 pt-6 border-t border-line flex items-center justify-between">
            <p className="text-sm text-mute">이 글을 삭제할까요?</p>
            <DeleteButton id={post.id} />
          </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
