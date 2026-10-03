// 메인 이번 주: 금주의 주보 카드(첫 쪽 미리보기) + 최근 공지사항 + 최근 매일의 묵상
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
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

async function loadLatestBulletin(): Promise<{ post: Post; cover?: Attachment } | null> {
  const [post] = await getRecentPosts("bulletin", 1);
  if (!post) return null;
  const covers = await getAlbumCovers([post.id]);
  return { post, cover: covers.get(post.id)?.cover };
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
  const [bulletin, notices, meditations] = await Promise.all([
    safe(loadLatestBulletin, null),
    safe(() => getRecentPosts("notice", LIST_SIZE), [] as Post[]),
    safe(() => getRecentPosts("meditation", LIST_SIZE), [] as Post[]),
  ]);

  return (
    <section className="py-16 md:py-24 bg-paper">
      <div className="shell">
        <SectionHead
          eyebrow="이번 주"
          title="이번 주 드림숲 소식"
          description="주보와 공지, 날마다 올라오는 묵상을 모았습니다."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="rounded-[24px] bg-white border border-line p-6 md:p-8 flex flex-col lg:min-h-[620px]">
            <CardHead title="금주의 주보" href={boards.bulletin.path} />
            {bulletin ? (
              <Link
                href={`${boards.bulletin.path}/${bulletin.post.id}`}
                className="group mt-6 flex flex-col items-center text-center flex-1"
              >
                <div className="w-[68%] max-w-[300px] aspect-[3/4] shadow-[0_12px_32px_rgba(31,36,33,0.10)] overflow-hidden rounded-xl border border-line bg-paper flex items-center justify-center">
                  {bulletin.cover?.thumb_key ? (
                    // 캐시되는 메인이라 서명 주소 대신 고정 주소(/r2/…)를 쓴다.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/r2/${bulletin.cover.thumb_key}`}
                      alt=""
                      className={`w-full h-full object-cover ${(bulletin.cover.width ?? 0) > (bulletin.cover.height ?? 0) ? "object-right-top" : "object-top"} group-hover:scale-[1.03] transition-transform duration-500`}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-red-600">PDF</span>
                  )}
                </div>
                <div className="mt-auto pt-6">
                  <p className="text-lg font-bold leading-snug text-ink">{bulletin.post.title}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-sub group-hover:border-forest group-hover:text-forest transition-colors">
                    주보 보기 ↗
                  </span>
                </div>
              </Link>
            ) : (
              <p className="flex-1 flex items-center justify-center py-10 text-sm text-mute">
                아직 등록된 주보가 없습니다.
              </p>
            )}
          </div>

          <PostList board={boards.notice} posts={notices} empty="아직 등록된 공지가 없습니다." />
          <PostList board={boards.meditation} posts={meditations} empty="아직 등록된 묵상이 없습니다." />
        </div>
      </div>
    </section>
  );
}
