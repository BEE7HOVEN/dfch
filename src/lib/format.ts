// post_date(YYYY-MM-DD 문자열)를 화면용 YYYY.MM.DD로 변환.
// date 타입은 타임존이 없으므로 Date() 변환 없이 문자열만 가공한다.
export function formatPostDate(ymd: string): string {
  if (!ymd) return "";
  return ymd.slice(0, 10).split("-").join(".");
}

// 한국 시간 기준 오늘 날짜를 YYYY-MM-DD로 반환 (서버 타임존과 무관).
export function seoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}
