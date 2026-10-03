// 교회소식 > 주보 본문 (한 쪽씩 넘겨 보기 + 이전·다음 주보)
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { ArticleHead } from "@/components/BoardDetail";
import BulletinViewer from "@/components/BulletinViewer";
import { boards } from "@/lib/boards";
import { getAdjacentPosts, getAttachments, getPost, type Post } from "@/lib/posts";
import { withViewUrls, type ViewableAttachment } from "@/lib/attachmentUrls";
import { createViewUrl } from "@/lib/r2";
import { formatPostDate } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { postMetadata } from "@/lib/postMetadata";
import { NO_SEARCH } from "@/lib/noSearch";

export const dynamic = "force-dynamic";

const board = boards.bulletin;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  // 주보에는 헌금자 명단·기도 제목 같은 교인 정보가 있어 검색에서 뺀다.
  return { ...(await postMetadata(board, id)), robots: NO_SEARCH };
}

function NeighborLink({ post, label, align }: { post: Post | null; label: string; align: "left" | "right" }) {
  const base = `flex-1 min-w-0 rounded-[20px] border border-line p-5 md:p-6 ${align === "right" ? "text-right" : ""}`;
  if (!post) {
    return (
      <div className={`${base} text-mute`}>
        <p className="text-sm">{label}</p>
        <p className="mt-1.5 text-[15px]">{align === "left" ? "이전 주보가 없습니다" : "다음 주보가 없습니다"}</p>
      </div>
    );
  }
  return (
    <Link href={`${board.path}/${post.id}`} className={`${base} group hover:border-forest transition-colors`}>
      <p className="text-sm text-mute">{label}</p>
      <p className="mt-1.5 text-[15px] font-semibold text-ink truncate group-hover:text-forest">{post.title}</p>
      <p className="mt-1 text-[13px] text-mute">{formatPostDate(post.post_date)}</p>
    </Link>
  );
}

export default async function BulletinDetailPage({ params }: Props) {
  const { id } = await params;
  const [post, isAdmin] = await Promise.all([getPost(id), isAuthenticated()]);
  if (!post || post.category !== board.category) notFound();

  let attachments: ViewableAttachment[] = [];
  let neighbors: { older: Post | null; newer: Post | null } = { older: null, newer: null };
  let pdfDownloadUrl: string | null = null;
  try {
    [attachments, neighbors] = await Promise.all([
      getAttachments(post.id).then(withViewUrls),
      getAdjacentPosts(post),
    ]);
  } catch (e) {
    console.error(e);
  }
  const images = attachments.filter((a) => a.kind === "image");
  const pdf = attachments.find((a) => a.kind === "pdf") ?? null;
  if (pdf) {
    try {
      pdfDownloadUrl = await createViewUrl(pdf.file_key, {
        downloadName: pdf.file_name ?? `${post.title}.pdf`,
        attachment: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Header />
      <main>
        <PageHeader path={board.path} />

        <article className="shell pb-20 md:pb-28">
          <ArticleHead
            title={post.title}
            meta={`${formatPostDate(post.post_date)}${images.length > 0 ? ` · ${images.length}쪽` : ""}`}
            editHref={isAdmin ? `/admin/edit/${post.id}` : undefined}
          />

          <div className="pt-8 md:pt-10">
            {images.length === 0 && !pdf ? (
              <p className="py-20 text-center text-mute">올라온 주보 파일이 없습니다.</p>
            ) : (
              <BulletinViewer
                title={post.title}
                pages={images.map((img) => ({
                  url: img.fileUrl,
                  thumbUrl: img.thumbUrl,
                  width: img.width,
                  height: img.height,
                }))}
                pdfUrl={pdf?.fileUrl ?? null}
                pdfDownloadUrl={pdfDownloadUrl}
              />
            )}
          </div>

          {post.content && (
            <div className="reading pt-10 whitespace-pre-wrap leading-[2] text-base md:text-[17px] text-ink">{post.content}</div>
          )}

          {/* 이전(지난주)·목록·다음(다음 주) */}
          <nav aria-label="다른 주보" className="mt-16 pt-8 border-t border-line">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <NeighborLink post={neighbors.older} label="← 이전 주보" align="left" />
              <NeighborLink post={neighbors.newer} label="다음 주보 →" align="right" />
            </div>
            <div className="mt-8 text-center">
              <Link
                href={board.path}
                className="inline-flex items-center rounded-full border border-line px-6 py-3 text-sm font-medium text-sub hover:border-forest hover:text-forest transition-colors"
              >
                주보 목록
              </Link>
            </div>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
