// 사이트 기본 주소와 이름. 카톡 등 링크 미리보기(Open Graph)에 절대 주소가 필요해 한 곳에 둔다.
// 운영은 Vercel 환경변수 SITE_URL(https://dfch.org)을 쓴다.
export const SITE_URL = process.env.SITE_URL ?? "https://dfch.org";
export const SITE_NAME = "드림숲교회";
export const SITE_DESCRIPTION =
  "말씀이 삶이 되고 섬김이 되는 공동체. 경기도 군포시 대한예수교장로회 드림숲교회입니다.";
export const DEFAULT_OG_IMAGE = "/images/main-intro.png";
export const YOUTUBE_URL = "https://www.youtube.com/@군포드림숲교회";
export const CHURCH_ADDRESS = "경기도 군포시 삼성로69번길 13";
export const CHURCH_PHONE = "031-421-6191";
