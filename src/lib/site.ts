// 사이트 기본 주소와 이름. 카톡 등 링크 미리보기(Open Graph)에 절대 주소가 필요해 한 곳에 둔다.
// dfch.kr 연결 뒤에는 Vercel 환경변수 SITE_URL만 바꾸면 된다.
export const SITE_URL = process.env.SITE_URL ?? "https://dfch.vercel.app";
export const SITE_NAME = "드림숲교회";
export const DEFAULT_OG_IMAGE = "/images/main-intro.png";
