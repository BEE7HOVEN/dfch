// 메인 갤러리: 사진 8장 바둑판. 최근 앨범마다 대표 사진(관리자가 정한 첫 사진)을 넣고, 모자라면 최근 앨범의 앞쪽 사진으로 채운다.
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import { boards } from "@/lib/boards";
import { getAlbumCovers, getAlbumPhotos, getRecentPosts, type Attachment, type Post } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";

const board = boards.gallery;
const SLOTS = 8;

interface Tile {
  album: Post;
  photo: Attachment;
  isCover: boolean; // 앨범의 대표 사진이면 이름·날짜를 얹는다
  count: number; // 앨범 사진 수
}

// 앨범마다 대표 사진 1장씩 자리를 주고, 남는 자리는 최근 앨범부터 앞쪽 사진으로 채운다. 앨범끼리 붙여 보여 준다.
function buildTiles(albums: Post[], photos: Map<string, Attachment[]>, counts: Map<string, number>): Tile[] {
  const withPhotos = albums.filter((a) => (photos.get(a.id)?.length ?? 0) > 0).slice(0, SLOTS);
  const take = new Map(withPhotos.map((a) => [a.id, 1]));
  let left = SLOTS - withPhotos.length;
  for (const a of withPhotos) {
    if (left <= 0) break;
    const extra = Math.min(left, (photos.get(a.id)?.length ?? 1) - 1);
    take.set(a.id, 1 + extra);
    left -= extra;
  }
  return withPhotos.flatMap((album) =>
    (photos.get(album.id) ?? []).slice(0, take.get(album.id)).map((photo, i) => ({
      album,
      photo,
      isCover: i === 0,
      count: counts.get(album.id) ?? 0,
    })),
  );
}

// DB를 못 읽어도 메인 화면 전체가 깨지지 않게 빈 목록으로 둔다.
async function loadTiles(): Promise<Tile[]> {
  try {
    const albums = await getRecentPosts("gallery", SLOTS);
    const ids = albums.map((a) => a.id);
    const [photos, covers] = await Promise.all([getAlbumPhotos(ids, SLOTS), getAlbumCovers(ids)]);
    const counts = new Map([...covers].map(([id, c]) => [id, c.count]));
    return buildTiles(albums, photos, counts);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function RecentAlbums() {
  const tiles = await loadTiles();

  return (
    <section className="py-16 md:py-24 bg-paper">
      <div className="shell">
        <SectionHead eyebrow="갤러리" title="우리가 함께한 자리" href={board.path} />
        {tiles.length === 0 ? (
          <p className="py-10 text-center text-sm text-mute">아직 등록된 앨범이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {tiles.map(({ album, photo, isCover, count }) => (
              <li key={photo.id}>
                <Link
                  href={`${board.path}/${album.id}`}
                  aria-label={`${album.title} 앨범 보기`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-[16px] bg-white"
                >
                  {photo.thumb_key && (
                    // 캐시되는 메인이라 서명 주소 대신 고정 주소(/r2/…)를 쓴다.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/r2/${photo.thumb_key}`}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                  )}
                  {isCover && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 pt-10 pb-3.5 text-white">
                      <span className="block text-[15px] md:text-base font-semibold leading-snug line-clamp-1">{album.title}</span>
                      <span className="mt-0.5 block text-xs text-white/80">
                        {formatPostDate(album.post_date)} · 사진 {count}장
                      </span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
