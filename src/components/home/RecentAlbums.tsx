// 메인 갤러리: 최근 앨범 4개 (표지·제목·날짜·사진 수)
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import { boards } from "@/lib/boards";
import { getAlbumCovers, getRecentPosts, type Attachment, type Post } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";

const board = boards.gallery;

// DB를 못 읽어도 메인 화면 전체가 깨지지 않게 빈 목록으로 둔다.
async function loadAlbums(): Promise<{ album: Post; cover?: { cover: Attachment; count: number } }[]> {
  try {
    const albums = await getRecentPosts("gallery", 4);
    const covers = await getAlbumCovers(albums.map((a) => a.id));
    return albums.map((album) => ({ album, cover: covers.get(album.id) }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function RecentAlbums() {
  const items = await loadAlbums();

  return (
    <section className="py-16 md:py-24 bg-paper">
      <div className="shell">
        <SectionHead eyebrow="갤러리" title="우리가 함께한 자리" href={board.path} />
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-mute">아직 등록된 앨범이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
            {items.map(({ album, cover }) => (
              <li key={album.id}>
                <Link href={`${board.path}/${album.id}`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-white">
                    {cover?.cover.thumb_key && (
                      // 캐시되는 메인이라 서명 주소 대신 고정 주소(/r2/…)를 쓴다.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/r2/${cover.cover.thumb_key}`}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    )}
                  </div>
                  <h3 className="mt-3.5 text-base md:text-[17px] font-semibold text-ink group-hover:text-forest line-clamp-1">
                    {album.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-mute">
                    {formatPostDate(album.post_date)}
                    {cover ? ` · 사진 ${cover.count}장` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
