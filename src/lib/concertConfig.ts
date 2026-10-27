// 초청음악회 예매 설정값과 표시 함수 (브라우저에서도 쓰므로 데이터베이스 코드는 넣지 않는다).
export const CAPACITY = 200; // 전체 좌석
export const ONSITE_RESERVED = 50; // 현장 접수 몫 (처음부터 찼다고 본다)
export const ONLINE_LIMIT = CAPACITY - ONSITE_RESERVED; // 온라인으로 받는 좌석
export const MAX_PARTY = 4;
export const LOW_SEATS = 20; // 이 이하면 "얼마 남지 않았습니다"
export const CLOSES_AT = new Date("2026-12-05T12:00:00+09:00"); // 예매 마감 (공연 당일 정오)
export const CONCERT_AT_LABEL = "2026년 12월 5일(토) 오후 4시";
export const DESTROY_BY_LABEL = "2026년 12월 12일";

export function formatNumber(n: number): string {
  return `C-${String(n).padStart(4, "0")}`;
}

export function formatPhone(digits: string): string {
  return digits.replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3");
}

