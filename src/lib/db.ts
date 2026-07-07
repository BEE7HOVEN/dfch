import { neon } from "@neondatabase/serverless";

// Neon(관리형 Postgres) 클라이언트. HTTP 기반이라 서버리스(Vercel)에서 커넥션 풀 걱정 없이 동작.
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  }
  return neon(url);
}
