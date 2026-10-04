// post_date(YYYY-MM-DD 문자열)를 화면용 YYYY.MM.DD로 변환.
// date 타입은 타임존이 없으므로 Date() 변환 없이 문자열만 가공한다.
export function formatPostDate(ymd: string): string {
  if (!ymd) return "";
  return ymd.slice(0, 10).split("-").join(".");
}

// YYYY-MM-DD에 날짜 수를 더한다 (배너 내리기 = 어제로 끝내기).
export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 한국 시간 기준 오늘 날짜를 YYYY-MM-DD로 반환 (서버 타임존과 무관).
export function seoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}
