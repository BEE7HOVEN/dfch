import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { requireAuth } from "@/lib/auth";
import { seoulToday } from "@/lib/format";
import { createLetterAction } from "../actions";
import PostForm from "../PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireAuth();

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
            <h1 className="text-2xl font-light text-[#2c2c2c] mt-2">
              새 목회편지
            </h1>
          </div>

          <PostForm
            action={createLetterAction}
            defaultDate={seoulToday()}
            submitLabel="발행하기"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
