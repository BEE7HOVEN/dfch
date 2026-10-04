// 교회소식 > 주보 목록: 이번 주 주보를 크게, 지난 주보는 표지 카드 바둑판으로
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { AdminPencil } from "@/components/BoardList";
import ShareButton from "@/components/ShareButton";
import { boards } from "@/lib/boards";
import { getAlbumCovers, getPostsByCategory } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { createViewUrl } from "@/lib/r2";
import { NO_SEARCH } from "@/lib/noSearch";

export const dynamic = "force-dynamic";

// 주보에는 교인 정보가 있어 목록도 검색에서 뺀다.
export const metadata = { robots: NO_SEARCH };

const board = boards.bulletin;

// 접는 가로 주보는 첫 장 오른쪽 칸이 표지라, 가로 쪽은 오른쪽을 기준으로 잘라 보여 준다.
function Cover({ url, landscape, className }: { url?: string; landscape?: boolean; className: string }) {
  return (
    <div className={`${className} overflow-hidden bg-paper border border-line flex items-center justify-center`}>
      {url ? (
        // R2 서명 주소라 next/image 최적화(무료 한도 있음)를 쓰지 않는다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={`w-full h-full object-cover ${landscape ? "object-right-top" : "object-top"} group-hover:scale-[1.03] transition-transform duration-500`} />
      ) : (
        <span className="text-sm font-semibold text-red-600">PDF</span>
      )}
    </div>
  );
}

export default async function BulletinPage() {
  const [bulletins, isAdmin] = await Promise.all([getPostsByCategory("bulletin"), isAuthenticated()]);
  const covers = await getAlbumCovers(bulletins.map((b) => b.id));
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
  const [latest, ...past] = bulletins;
  const isLandscape = (id: string) => {
    const c = covers.get(id)?.cover;
    return Boolean(c?.width && c?.height && c.width > c.height);
  };

  return (
    <>
      <Header />
      <main>
        <PageHeader path={board.path} />

        <section className="shell pb-20 md:pb-28">
          <div className="flex items-center justify-between pb-4 border-b-2 border-ink">
            <p className="text-sm text-mute">
              전체 <span className="font-semibold text-ink">{bulletins.length}</span>개
            </p>
            <AdminPencil isAdmin={isAdmin} />
          </div>

          {!latest ? (
            <p className="py-24 text-center text-mute">아직 등록된 주보가 없습니다.</p>
          ) : (
            <>
              {/* 카드 안에 공유 단추를 두려고 카드 전체가 아니라 표지·제목·넘겨 보기를 각각 링크로 둔다. */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 md:gap-14 items-center rounded-[24px] bg-mist p-6 md:p-12">
                <Link href={`${board.path}/${latest.id}`} className="group block w-full max-w-[360px] mx-auto" aria-label={`${latest.title} 넘겨 보기`}>
                  <Cover
                    url={coverUrls.get(latest.id)}
                    landscape={isLandscape(latest.id)}
                    className="w-full aspect-[3/4] rounded-xl shadow-[0_16px_40px_rgba(31,36,33,0.14)]"
                  />
                </Link>
                <div>
                  <p className="text-sm font-semibold text-forest">이번 주 주보</p>
                  <h2 className="mt-3 text-[24px] md:text-[34px] font-bold leading-snug text-ink">
                    <Link href={`${board.path}/${latest.id}`} className="hover:text-forest">
                      {latest.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[15px] text-sub">{formatPostDate(latest.post_date)}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href={`${board.path}/${latest.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
                    >
                      주보 넘겨 보기 →
                    </Link>
                    <ShareButton title={latest.title} path={`${board.path}/${latest.id}`} pill />
                  </div>
                </div>
              </div>

              {past.length > 0 && (
                <>
                  <h2 className="mt-16 md:mt-20 text-[22px] md:text-[26px] font-bold text-ink">지난 주보</h2>
                  <ul className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6">
                    {past.map((b) => (
                      <li key={b.id}>
                        <Link href={`${board.path}/${b.id}`} className="group block">
                          <Cover url={coverUrls.get(b.id)} landscape={isLandscape(b.id)} className="aspect-[3/4] rounded-[16px]" />
                          <h3 className="mt-3.5 text-[15px] md:text-base font-semibold text-ink line-clamp-2 group-hover:text-forest">
                            {b.title}
                          </h3>
                          <p className="mt-1 text-[13px] text-mute">{formatPostDate(b.post_date)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
