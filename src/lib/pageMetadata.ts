// 안내·목록 페이지의 검색용 제목·설명·대표 주소. 제목은 메뉴 이름을 쓰고, 뒤의 "| 드림숲교회"는 레이아웃 template이 붙인다.
import type { Metadata } from "next";
import { findNavTrail } from "@/lib/nav";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";

// 페이지가 openGraph를 정하면 레이아웃 값이 통째로 바뀌므로 공통 값을 함께 넣는다.
export const BASE_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: "ko_KR",
  type: "website",
  images: [DEFAULT_OG_IMAGE],
} satisfies Metadata["openGraph"];

export function pageMetadata(path: string, description: string): Metadata {
  const title = findNavTrail(path)?.item.label;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...BASE_OPEN_GRAPH, title, description, url: path },
  };
}
