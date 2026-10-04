// 메인 이번 주: 넓은 금주의 주보 카드(첫 쪽 전체) + 최근 공지사항. 매일의 묵상은 말씀과 예배 칸(RecentMeditations)으로 옮김.
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import ShareButton from "@/components/ShareButton";
import { boards, type Board } from "@/lib/boards";
import { getAlbumCovers, getRecentPosts, type Attachment, type Post } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";

// DB를 못 읽어도 메인 화면 전체가 깨지지 않게 빈 목록으로 둔다.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return fallback;
  }
}

async function loadLatestBulletin(): Promise<{ post: Post; cover?: Attachment; pages: number } | null> {
  const [post] = await getRecentPosts("bulletin", 1);
  if (!post) return null;
  const covers = await getAlbumCovers([post.id]);
  const c = covers.get(post.id);
  return { post, cover: c?.cover, pages: c?.count ?? 0 };
}

// 카드 높이(약 620px)에 맞춰 공지·묵상을 몇 개까지 보여 줄지
const LIST_SIZE = 9;

function CardHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <Link href={href} className="text-sm text-mute hover:text-forest">
        전체보기 →
      </Link>
    </div>
  );
}

function PostList({ board, posts, empty }: { board: Board; posts: Post[]; empty: string }) {
  return (
    <div className="rounded-[24px] bg-white border border-line p-6 md:p-8 flex flex-col lg:min-h-[620px]">
      <CardHead title={board.label} href={board.path} />
      {posts.length === 0 ? (
        <p className="flex-1 flex items-center justify-center py-10 text-sm text-mute">{empty}</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`${board.path}/${post.id}`} className="group flex items-center gap-3 py-4">
                {post.audio_key && (
                  <span className="shrink-0 rounded-md bg-mist px-1.5 py-0.5 text-[11px] font-semibold text-forest">
                    녹음
                  </span>
                )}
                <span className="flex-1 min-w-0 truncate text-[15px] text-ink group-hover:text-forest">
                  {post.title}
                </span>
                <span className="shrink-0 text-[13px] text-mute">{formatPostDate(post.post_date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function ThisWeek() {
  const [bulletin, notices] = await Promise.all([
    safe(loadLatestBulletin, null),
    safe(() => getRecentPosts("notice", LIST_SIZE), [] as Post[]),
  ]);
  const ratio =
    bulletin?.cover?.width && bulletin.cover.height ? bulletin.cover.width / bulletin.cover.height : Math.SQRT2;
  const bulletinHref = bulletin ? `${boards.bulletin.path}/${bulletin.post.id}` : boards.bulletin.path;

  return (
    <section className="py-16 md:py-24 bg-paper">
      <div className="shell">
        <SectionHead eyebrow="이번 주" title="이번 주 드림숲 소식" description="이번 주 주보와 교회 공지를 모았습니다." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 주보는 가로 A4가 많아 두 칸 너비로 넓게, 첫 쪽 전체를 보여 준다. */}
          <div className="lg:col-span-2 rounded-[24px] bg-white border border-line p-6 md:p-8 flex flex-col lg:min-h-[620px]">
            <CardHead title="금주의 주보" href={boards.bulletin.path} />
            {bulletin ? (
              <div className="mt-6 flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px] gap-6 xl:gap-8 items-center">
                <Link
                  href={bulletinHref}
                  aria-label={`${bulletin.post.title} 넘겨 보기`}
                  className={`group relative block w-full aspect-(--page-ratio) xl:aspect-auto xl:h-[440px] rounded-xl ${bulletin.cover?.file_key ? "" : "bg-paper"}`}
                  style={{ "--page-ratio": String(ratio) } as React.CSSProperties}
                >
                  {bulletin.cover?.file_key ? (
                    // 캐시되는 메인이라 서명 주소 대신 고정 주소(/r2/…)를 쓴다.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/r2/${bulletin.cover.file_key}`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_24px_rgba(31,36,33,0.16)] group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-red-600">PDF</span>
                  )}
                </Link>
                <div>
                  <p className="text-sm font-semibold text-forest">이번 주 주보</p>
                  <p className="mt-2 text-xl font-bold leading-snug text-ink">{bulletin.post.title}</p>
                  <p className="mt-2 text-sm text-mute">
                    {formatPostDate(bulletin.post.post_date)}
                    {bulletin.pages > 0 && ` · ${bulletin.pages}쪽`}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={bulletinHref}
                      className="inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
                    >
                      주보 넘겨 보기 →
                    </Link>
                    <ShareButton title={bulletin.post.title} path={bulletinHref} pill />
                  </div>
                </div>
              </div>
            ) : (
              <p className="flex-1 flex items-center justify-center py-10 text-sm text-mute">아직 등록된 주보가 없습니다.</p>
            )}
          </div>

          <PostList board={boards.notice} posts={notices} empty="아직 등록된 공지가 없습니다." />
        </div>
      </div>
    </section>
  );
}
