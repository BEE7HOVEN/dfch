import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { requireAuth } from "@/lib/auth";
import { getPost } from "@/lib/posts";
import { updateLetterAction } from "../../actions";
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
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="pt-16 min-h-[60vh]">
        <Hero image="/images/hero-5.jpg" title="목회편지" />
        <section className="max-w-2xl mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <Link
              href="/letters"
              className="text-sm text-[#999] hover:text-[#2c2c2c] transition-colors"
            >
              ← 목회편지
            </Link>
            <h1 className="text-2xl font-light text-[#2c2c2c] mt-2">글 수정</h1>
          </div>

          <PostForm
            action={updateLetterAction}
            post={post}
            defaultDate={post.post_date}
            submitLabel="수정 저장"
          />

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-[#999]">이 글을 삭제할까요?</p>
            <DeleteButton id={post.id} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
