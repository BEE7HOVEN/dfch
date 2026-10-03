// 교회소식 > 갤러리 앨범 화면 (사진 바둑판, 누르면 크게 보기)
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import PhotoGrid from "@/components/PhotoGrid";
import ShareButton from "@/components/ShareButton";
import { boards } from "@/lib/boards";
import { getAttachments, getPost } from "@/lib/posts";
import { withViewUrls } from "@/lib/attachmentUrls";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { postMetadata } from "@/lib/postMetadata";

export const dynamic = "force-dynamic";

const board = boards.gallery;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return postMetadata(board, id);
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const [album, isAdmin] = await Promise.all([getPost(id), isAuthenticated()]);
  if (!album || album.category !== "gallery") notFound();

  const photos = (await withViewUrls(await getAttachments(id)))
    .filter((a) => a.kind === "image")
    .map((a) => ({
      id: a.id,
      thumbUrl: a.thumbUrl ?? a.fileUrl,
      fileUrl: a.fileUrl,
      width: a.width,
      height: a.height,
    }));

  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero
          image={board.heroImage}
          title={album.title}
          subtitle={`${formatPostDate(album.post_date)} · 사진 ${photos.length}장`}
        />

        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-end gap-5 mb-6">
            <ShareButton title={album.title} />
            {isAdmin && (
              <Link
                href={`/admin/edit/${album.id}`}
                className="text-sm text-[#666] hover:text-[#2c2c2c] transition-colors"
              >
                수정
              </Link>
            )}
          </div>

          {album.content && (
            <p className="whitespace-pre-wrap leading-[2] text-base text-[#404040] mb-8">
              {album.content}
            </p>
          )}

          <PhotoGrid photos={photos} title={album.title} />

          <div className="mt-16 pt-8 border-t border-gray-100 text-center">
            <Link
              href={board.path}
              className="text-sm text-[#666] hover:text-[#2c2c2c] transition-colors"
            >
              ← 앨범 목록으로
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
