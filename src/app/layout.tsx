import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { BASE_OPEN_GRAPH } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // 하위 페이지 제목 뒤에 교회 이름을 붙인다 (예: "교회 소개 | 드림숲교회").
  title: { default: `${SITE_NAME} · 군포 산본`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: BASE_OPEN_GRAPH,
  // 네이버 서치어드바이저 소유 확인 (구글은 Cloudflare DNS TXT로 확인).
  verification: { other: { "naver-site-verification": "a476bc0e91ec3831d6eb1cbbf156eb5a8114834f" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased scroll-smooth">
      <head>
        {/* Pretendard: 글자 범위별로 필요한 부분만 내려받는 한글 웹 글꼴 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
