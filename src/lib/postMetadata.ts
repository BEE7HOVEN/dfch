// 게시판 글 본문 페이지의 링크 미리보기(Open Graph) 정보. 카톡으로 공유할 때 제목·설명·대표 사진 카드가 된다.
import type { Metadata } from "next";
import type { Board } from "@/lib/boards";
import { getAttachments, getPost } from "@/lib/posts";
import { formatPostDate } from "@/lib/format";
import { createViewUrl } from "@/lib/r2";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";

function summarize(text: string, max = 90): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

export async function postMetadata(board: Board, id: string): Promise<Metadata> {
  const post = await getPost(id);
  if (!post || post.category !== board.category) return {};

  const description =
    summarize(post.content) ||
    `${board.label} · ${formatPostDate(post.post_date)} · ${SITE_NAME}`;

  // 사진이 있는 게시판(갤러리·주보)은 첫 사진을 대표 사진으로 쓴다.
  let image = DEFAULT_OG_IMAGE;
  if (board.attachments) {
    const first = (await getAttachments(id)).find((a) => a.kind === "image");
    if (first) {
      try {
        image = await createViewUrl(first.file_key);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return {
    title: `${post.title} | ${board.label} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `${board.path}/${id}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      images: [image],
    },
  };
}
