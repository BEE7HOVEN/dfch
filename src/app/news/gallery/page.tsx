// 교회소식 > 갤러리 앨범 목록 (표지 사진·제목·날짜·사진 수)
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
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
      <main className="pt-16">
        <Hero image={board.heroImage} title={board.label} />

        <section className="pt-8 md:pt-10 pb-20 md:pb-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-end mb-4 min-h-[2rem]">
              <Link
                href={isAdmin ? "/admin" : "/admin/login"}
                aria-label={isAdmin ? "관리" : "관리자 로그인"}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </Link>
            </div>

            {albums.length === 0 ? (
              <p className="text-center text-[#999] py-20">아직 등록된 앨범이 없습니다.</p>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {albums.map((album) => {
                  const url = coverUrls.get(album.id);
                  const count = covers.get(album.id)?.count ?? 0;
                  return (
                    <li key={album.id}>
                      <Link href={`${board.path}/${album.id}`} className="group block">
                        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                          {url && (
                            // R2 서명 주소라 next/image 최적화(무료 한도 있음)를 쓰지 않는다.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <h2 className="mt-3 text-base md:text-lg text-[#404040] group-hover:text-[#2c2c2c] line-clamp-1">
                          {album.title}
                        </h2>
                        <p className="mt-1 text-xs md:text-sm text-[#999]">
                          {formatPostDate(album.post_date)} · 사진 {count}장
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
