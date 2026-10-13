// 검색 수집 규칙 (/robots.txt): 관리자 화면과 R2 사진 고정 주소(메인의 주보 표지·앨범 미리보기)는 수집하지 않는다.
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/r2/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
