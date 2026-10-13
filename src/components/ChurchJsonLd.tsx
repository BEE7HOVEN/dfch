// 검색엔진이 읽는 교회 정보(JSON-LD). 구글 검색의 교회 이름·주소·전화 정보와 사이트 이름 표시에 쓰인다.
import { CHURCH_ADDRESS, CHURCH_PHONE, SITE_DESCRIPTION, SITE_NAME, SITE_URL, YOUTUBE_URL } from "@/lib/site";

const data = [
  {
    "@context": "https://schema.org",
    "@type": "Church",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-dark.png`,
    image: `${SITE_URL}/images/main-intro.png`,
    telephone: CHURCH_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: CHURCH_ADDRESS.replace(/^경기도 군포시 /, ""),
      addressLocality: "군포시",
      addressRegion: "경기도",
      addressCountry: "KR",
    },
    sameAs: [YOUTUBE_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
];

export default function ChurchJsonLd() {
  return (
    <script
      type="application/ld+json"
      // 고정 값만 들어가지만 "<"는 이스케이프해 스크립트 태그가 닫히지 않게 한다.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
