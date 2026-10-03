// 메인 화면의 최근 갤러리 앨범 칸 (표지·제목·날짜·사진 수, 더보기 링크)
import Link from "next/link";
import { boards } from "@/lib/boards";
import { getAlbumCovers, getRecentPosts, type Attachment, type Post } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";

const LIMIT = 4;
const board = boards.gallery;

// DB를 못 읽어도 메인 화면 전체가 깨지지 않게 빈 목록으로 둔다.
async function loadAlbums(): Promise<
  { album: Post; cover?: { cover: Attachment; count: number } }[]
> {
  try {
    const albums = await getRecentPosts("gallery", LIMIT);
    const covers = await getAlbumCovers(albums.map((a) => a.id));
    return albums.map((album) => ({ album, cover: covers.get(album.id) }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function HomeRecentAlbums() {
  const items = await loadAlbums();

  return (
    <section className="pt-16 md:pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-[#2c2c2c]/80">
          <h2 className="text-xl md:text-2xl font-light text-[#2c2c2c]">{board.label}</h2>
          <Link
            href={board.path}
            className="text-sm text-[#999] hover:text-[#2c2c2c] transition-colors"
          >
            더보기 →
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#999]">아직 등록된 앨범이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {items.map(({ album, cover }) => {
              const thumbKey = cover?.cover.thumb_key;
              return (
                <li key={album.id}>
                  <Link href={`${board.path}/${album.id}`} className="group block">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                      {thumbKey && (
                        // 캐시되는 메인이라 서명 주소 대신 고정 주소(/r2/…)를 쓴다.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/r2/${thumbKey}`}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <h3 className="mt-2.5 text-[15px] md:text-base text-[#404040] group-hover:text-[#2c2c2c] line-clamp-1">
                      {album.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#999]">
                      {formatPostDate(album.post_date)}
                      {cover ? ` · 사진 ${cover.count}장` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
