// 교회소식 > 갤러리 앨범 화면 (사진 바둑판, 누르면 크게 보기)
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { ArticleHead, BackToList } from "@/components/BoardDetail";
import PhotoGrid from "@/components/PhotoGrid";
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
      <main>
        <PageHeader path={board.path} />

        <section className="shell pb-20 md:pb-28">
          <ArticleHead
            title={album.title}
            meta={`${formatPostDate(album.post_date)} · 사진 ${photos.length}장`}
            editHref={isAdmin ? `/admin/edit/${album.id}` : undefined}
          />

          {album.content && (
            <p className="reading pt-8 whitespace-pre-wrap leading-[1.9] text-base text-sub">{album.content}</p>
          )}

          <div className="pt-8 md:pt-10">
            <PhotoGrid photos={photos} title={album.title} />
          </div>

          <BackToList href={board.path} label="앨범 목록으로" />
        </section>
      </main>
      <Footer />
    </>
  );
}
