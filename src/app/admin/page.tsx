// 관리자 글 관리: 게시판별 탭으로 나눠 보고, 그 자리에서 새 글·수정·삭제. 배너는 사진 카드로 보여 주고 내리기·다시 걸기를 둔다.
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { getAlbumCovers, getAllPosts, type Post } from "@/lib/posts";
import { formatPostDate, seoulToday } from "@/lib/format";
import { boards, isBoardCategory, type Board, type BoardCategory } from "@/lib/boards";
import { createViewUrl } from "@/lib/r2";
import { logoutAction, toggleBannerAction } from "./actions";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

const TAB_ORDER: BoardCategory[] = ["notice", "meditation", "letter", "bulletin", "gallery", "banner"];

type Cover = { url: string | null; count: number };

// 사진이 있는 게시판(갤러리·주보·배너)의 글마다 첫 사진 미리보기 주소와 사진 수
async function loadCovers(posts: Post[]): Promise<Map<string, Cover>> {
  const covers = await getAlbumCovers(posts.map((p) => p.id));
  const result = new Map<string, Cover>();
  await Promise.all(
    [...covers].map(async ([id, { cover, count }]) => {
      let url: string | null = null;
      try {
        url = await createViewUrl(cover.thumb_key ?? cover.file_key);
      } catch (e) {
        console.error(e);
      }
      result.set(id, { url, count });
    }),
  );
  return result;
}

function EditDelete({ id }: { id: string }) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <Link href={`/admin/edit/${id}`} className="text-sm font-medium text-sub hover:text-forest">
        수정
      </Link>
      <DeleteButton id={id} />
    </div>
  );
}

function Thumb({ url, className }: { url: string | null | undefined; className: string }) {
  return (
    <div className={`${className} overflow-hidden bg-paper border border-line flex items-center justify-center`}>
      {url ? (
        // R2 서명 주소라 next/image 최적화를 쓰지 않는다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs text-mute">사진 없음</span>
      )}
    </div>
  );
}

// 글 게시판(공지·묵상·목회편지): 날짜·제목 표
function PostTable({ board, posts }: { board: Board; posts: Post[] }) {
  return (
    <ul className="border-t-2 border-ink">
      {posts.map((post) => (
        <li key={post.id} className="flex items-center gap-4 border-b border-line px-1 md:px-3 py-4">
          <span className="hidden sm:block w-24 shrink-0 text-sm text-mute tabular-nums">{formatPostDate(post.post_date)}</span>
          <div className="flex-1 min-w-0">
            <Link href={`${board.path}/${post.id}`} className="block truncate text-[15px] md:text-base text-ink hover:text-forest">
              {post.audio_key && (
                <span className="mr-2 rounded-md bg-mist px-1.5 py-0.5 text-[11px] font-semibold text-forest align-middle">녹음</span>
              )}
              {post.title}
            </Link>
            <span className="sm:hidden mt-1 block text-xs text-mute">{formatPostDate(post.post_date)}</span>
          </div>
          <EditDelete id={post.id} />
        </li>
      ))}
    </ul>
  );
}

// 사진 게시판(갤러리·주보): 표지 카드
function CoverGrid({ board, posts, covers }: { board: Board; posts: Post[]; covers: Map<string, Cover> }) {
  const portrait = board.category === "bulletin";
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {posts.map((post) => {
        const c = covers.get(post.id);
        return (
          <li key={post.id} className="rounded-[20px] border border-line p-3 flex flex-col">
            <Link href={`${board.path}/${post.id}`} className="group block">
              <Thumb url={c?.url} className={`${portrait ? "aspect-[3/4]" : "aspect-[4/3]"} rounded-xl`} />
              <p className="mt-3 text-[15px] font-semibold text-ink line-clamp-2 group-hover:text-forest">{post.title}</p>
            </Link>
            <p className="mt-1 text-xs text-mute">
              {formatPostDate(post.post_date)} · {portrait ? `${c?.count ?? 0}쪽` : `사진 ${c?.count ?? 0}장`}
            </p>
            <div className="mt-auto pt-3">
              <EditDelete id={post.id} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function bannerStatus(post: Post, today: string): { label: string; tone: string; live: boolean } {
  if (post.ends_on && post.ends_on < today) return { label: "내림", tone: "bg-paper text-mute", live: false };
  if (post.post_date > today) return { label: "예약", tone: "bg-amber-50 text-amber-700", live: false };
  return { label: "게시 중", tone: "bg-forest text-white", live: true };
}

// 배너: 큰 사진 카드 + 상태·기간 + 내리기/다시 걸기
function BannerGrid({ posts, covers }: { posts: Post[]; covers: Map<string, Cover> }) {
  const today = seoulToday();
  const live = posts.filter((p) => bannerStatus(p, today).live).length;
  return (
    <>
      <p className="mb-5 text-sm text-sub">
        지금 메인에 <b className="text-forest">{live}개</b>가 걸려 있습니다. 여러 개면 6초마다 넘어가며, 게시 시작일이 최근인 것부터 나옵니다.
        내린 배너는 지워지지 않아 언제든 다시 걸 수 있습니다.
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {posts.map((post) => {
          const s = bannerStatus(post, today);
          const c = covers.get(post.id);
          return (
            <li key={post.id} className={`rounded-[20px] border p-3 flex flex-col ${s.live ? "border-forest/40" : "border-line"}`}>
              <div className={`relative ${s.live ? "" : "opacity-60"}`}>
                <Thumb url={c?.url} className="aspect-[19/10] rounded-xl" />
                <span className={`absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold ${s.tone}`}>{s.label}</span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink line-clamp-1">{post.title}</p>
              <p className="mt-1 text-xs text-mute">
                {formatPostDate(post.post_date)} ~ {post.ends_on ? formatPostDate(post.ends_on) : "종료일 없음"}
                {post.link_url && <> · 링크 {post.link_url}</>}
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                <form action={toggleBannerAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="mode" value={s.live ? "off" : "on"} />
                  <button
                    type="submit"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      s.live ? "border border-line text-sub hover:border-forest hover:text-forest" : "bg-forest text-white hover:bg-forest-deep"
                    }`}
                  >
                    {s.live ? "내리기" : s.label === "예약" ? "종료일 없애기" : "다시 걸기"}
                  </button>
                </form>
                <EditDelete id={post.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAuth();
  const sp = await searchParams;
  const active: BoardCategory = isBoardCategory(sp.board) ? sp.board : TAB_ORDER[0];
  const board = boards[active];

  const all = await getAllPosts();
  const counts = new Map<string, number>();
  for (const p of all) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const posts = all.filter((p) => p.category === active);
  const covers = board.attachments ? await loadCovers(posts) : new Map<string, Cover>();

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <PageHeader path="/admin" title="글 관리" />
        <section className="shell pb-20 md:pb-28">
          {/* 게시판 탭 */}
          <div className="flex items-end justify-between gap-4 border-b border-line">
            <nav className="flex gap-1 overflow-x-auto -mb-px" aria-label="게시판">
              {TAB_ORDER.map((cat) => (
                <Link
                  key={cat}
                  href={`/admin?board=${cat}`}
                  aria-current={cat === active ? "page" : undefined}
                  className={`shrink-0 px-3 md:px-4 pb-3 pt-1 border-b-[3px] text-[15px] md:text-base font-semibold transition-colors ${
                    cat === active ? "border-forest text-forest" : "border-transparent text-mute hover:text-ink"
                  }`}
                >
                  {boards[cat].label}
                  <span className="ml-1.5 text-xs font-medium tabular-nums">{counts.get(cat) ?? 0}</span>
                </Link>
              ))}
            </nav>
            <form action={logoutAction} className="shrink-0 pb-3">
              <button type="submit" className="text-sm text-mute hover:text-forest">
                로그아웃
              </button>
            </form>
          </div>

          {/* 이 게시판 도구 */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-6">
            <p className="text-sm text-mute">
              {board.label} <b className="text-ink">{posts.length}</b>개
              {board.category !== "banner" && (
                <Link href={board.path} className="ml-3 text-sub hover:text-forest">
                  게시판에서 보기 ↗
                </Link>
              )}
            </p>
            <Link
              href={`/admin/new?board=${board.category}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
            >
              + {board.newLabel}
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="py-24 text-center text-mute border-t-2 border-ink">아직 등록된 글이 없습니다.</p>
          ) : board.category === "banner" ? (
            <BannerGrid posts={posts} covers={covers} />
          ) : board.attachments ? (
            <CoverGrid board={board} posts={posts} covers={covers} />
          ) : (
            <PostTable board={board} posts={posts} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
