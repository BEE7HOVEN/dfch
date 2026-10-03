// 관리자가 글을 쓰는 게시판 목록 (분류값 → 화면 이름·주소·입력칸 구성). 클라이언트에서도 쓰므로 DB 코드를 넣지 않는다.
export type BoardCategory = "letter" | "meditation";

export interface Board {
  category: BoardCategory;
  label: string;
  path: string;
  heroImage: string;
  newLabel: string; // 관리자 화면의 새 글 버튼·제목
  titleLabel: string; // 제목 칸 이름
  titlePlaceholder?: string;
  contentRequired: boolean; // false면 내용 칸은 "메모 (선택)"
  hasAudio: boolean; // 녹음 파일 첨부(R2) 여부
}

export const boards: Record<BoardCategory, Board> = {
  letter: {
    category: "letter",
    label: "목회편지",
    path: "/letters",
    heroImage: "/images/hero-5.jpg",
    newLabel: "목회편지 쓰기",
    titleLabel: "제목",
    contentRequired: true,
    hasAudio: false,
  },
  meditation: {
    category: "meditation",
    label: "매일의 묵상",
    path: "/meditation",
    heroImage: "/images/hero-3.jpg",
    newLabel: "묵상 올리기",
    titleLabel: "본문",
    titlePlaceholder: "예: 사무엘상 25:1-13",
    contentRequired: false,
    hasAudio: true,
  },
};

export function isBoardCategory(value: unknown): value is BoardCategory {
  return typeof value === "string" && value in boards;
}
