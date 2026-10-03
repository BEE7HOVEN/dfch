// 교회소식 > 갤러리 앨범 목록 (표지 사진·제목·날짜·사진 수)
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { AdminPencil } from "@/components/BoardList";
import { boards } from "@/lib/boards";
import { getAlbumCovers, getPostsByCategory } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { createViewUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const board = boards.gallery;

export default async function GalleryPage() {
  const [albums, isAdmin] = await Promise.all([
    getPostsByCategory("gallery"),
    isAuthenticated(),
  ]);
  const covers = await getAlbumCovers(albums.map((a) => a.id));
  const coverUrls = new Map<string, string>();
  await Promise.all(
    [...covers].map(async ([postId, { cover }]) => {
      try {
        coverUrls.set(postId, await createViewUrl(cover.thumb_key ?? cover.file_key));
      } catch (e) {
        console.error(e);
      }
    }),
  );

  return (
    <>
      <Header />
      <main>
        <PageHeader path={board.path} />

        <section className="shell pb-20 md:pb-28">
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-ink">
            <p className="text-sm text-mute">
              앨범 <span className="font-semibold text-ink">{albums.length}</span>개
            </p>
            <AdminPencil isAdmin={isAdmin} />
          </div>
            {albums.length === 0 ? (
              <p className="text-center text-mute py-24">아직 등록된 앨범이 없습니다.</p>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {albums.map((album) => {
                  const url = coverUrls.get(album.id);
                  const count = covers.get(album.id)?.count ?? 0;
                  return (
                    <li key={album.id}>
                      <Link href={`${board.path}/${album.id}`} className="group block">
                        <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-paper">
                          {url && (
                            // R2 서명 주소라 next/image 최적화(무료 한도 있음)를 쓰지 않는다.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            />
                          )}
                        </div>
                        <h2 className="mt-3.5 text-base md:text-lg font-semibold text-ink group-hover:text-forest line-clamp-1">
                          {album.title}
                        </h2>
                        <p className="mt-1 text-[13px] text-mute">
                          {formatPostDate(album.post_date)} · 사진 {count}장
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
        </section>
      </main>
      <Footer />
    </>
  );
}
