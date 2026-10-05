// 메인 갤러리: 가장 최근 앨범의 앞쪽 사진 8장 바둑판 (앨범 안 순서는 관리자가 정한 대로). 8장이 안 되면 바로 이전 앨범 사진으로 채운다.
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
}

interface Gallery {
  latest: { album: Post; count: number };
  tiles: Tile[];
}

// DB를 못 읽어도 메인 화면 전체가 깨지지 않게 칸을 숨긴다.
async function loadGallery(): Promise<Gallery | null> {
  try {
    const albums = await getRecentPosts("gallery", 4);
    const ids = albums.map((a) => a.id);
    const [photos, covers] = await Promise.all([getAlbumPhotos(ids, SLOTS), getAlbumCovers(ids)]);
    const withPhotos = albums.filter((a) => (photos.get(a.id)?.length ?? 0) > 0);
    if (withPhotos.length === 0) return null;
    // 최신 앨범부터 차례로 8장이 찰 때까지 담는다.
    const tiles: Tile[] = [];
    for (const album of withPhotos) {
      for (const photo of photos.get(album.id) ?? []) {
        if (tiles.length < SLOTS) tiles.push({ album, photo });
      }
    }
    const latest = withPhotos[0];
    return { latest: { album: latest, count: covers.get(latest.id)?.count ?? 0 }, tiles };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function RecentAlbums() {
  const gallery = await loadGallery();
  const latest = gallery?.latest;
  const more = latest ? latest.count - SLOTS : 0; // 최신 앨범에서 칸에 못 넣은 사진 수

  return (
    <section className="py-16 md:py-24 bg-paper">
      <div className="shell">
        <SectionHead
          eyebrow="갤러리"
          title="우리가 함께한 자리"
          description={latest ? `${latest.album.title} · ${formatPostDate(latest.album.post_date)} · 사진 ${latest.count}장` : undefined}
          href={board.path}
          linkLabel="갤러리 전체보기"
        />
        {!gallery ? (
          <p className="py-10 text-center text-sm text-mute">아직 등록된 앨범이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {gallery.tiles.map(({ album, photo }, i) => {
              const isMore = more > 0 && i === gallery.tiles.length - 1 && album.id === latest!.album.id;
              return (
                <li key={photo.id}>
                  <Link
                    href={`${board.path}/${album.id}`}
                    aria-label={isMore ? `${album.title} 앨범 사진 ${more}장 더 보기` : `${album.title} 앨범 보기`}
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
                    {isMore && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                        <span className="text-2xl md:text-3xl font-bold">+{more}장</span>
                        <span className="mt-1 text-sm">앨범 더 보기</span>
                      </span>
                    )}
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
