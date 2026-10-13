// 검색엔진에 알려 줄 주소 목록 (/sitemap.xml). 주보(교인 정보)와 배너는 넣지 않는다.
import type { MetadataRoute } from "next";
import { boards, type BoardCategory } from "@/lib/boards";
import { navGroups } from "@/lib/nav";
import { getSitemapPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

// 새 글이 한 시간 안에 들어가도록 다시 만든다.
export const revalidate = 3600;

const POST_BOARDS: BoardCategory[] = ["notice", "meditation", "letter", "gallery"];
const EXCLUDED_PAGES = new Set([boards.bulletin.path]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...navGroups
      .flatMap((g) => g.children)
      .filter((c) => !EXCLUDED_PAGES.has(c.href))
      .map((c) => ({ url: `${SITE_URL}${c.href}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];

  // DB를 못 읽어도 고정 페이지 목록은 내보낸다.
  let posts: Awaited<ReturnType<typeof getSitemapPosts>> = [];
  try {
    posts = await getSitemapPosts(POST_BOARDS);
  } catch (e) {
    console.error(e);
  }

  return [
    ...pages,
    ...posts.map((p) => ({
      url: `${SITE_URL}${boards[p.category as BoardCategory].path}/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
