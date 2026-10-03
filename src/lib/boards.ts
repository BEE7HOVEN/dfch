// 관리자가 글을 쓰는 게시판 목록 (분류값 → 화면 이름·주소·입력칸 구성). 클라이언트에서도 쓰므로 DB 코드를 넣지 않는다.
export type BoardCategory =
  | "letter"
  | "meditation"
  | "notice"
  | "gallery"
  | "bulletin";

export interface Board {
  category: BoardCategory;
  label: string;
  path: string;
  heroImage: string;
  newLabel: string; // 관리자 화면의 새 글 버튼·제목
  titleLabel: string; // 제목 칸 이름
  titlePlaceholder?: string;
  titleRequired: boolean; // false면 비워 둘 때 서버가 날짜로 제목을 채운다
  contentLabel: string;
  contentRequired: boolean;
  hasAudio: boolean; // 녹음 파일 첨부(R2) 여부
  attachments?: "images" | "images+pdf"; // 사진(과 PDF) 첨부(R2) 여부
}

export const boards: Record<BoardCategory, Board> = {
  letter: {
    category: "letter",
    label: "목회편지",
    path: "/letters",
    heroImage: "/images/hero-5.jpg",
    newLabel: "목회편지 쓰기",
    titleLabel: "제목",
    titleRequired: true,
    contentLabel: "내용",
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
    titleRequired: true,
    contentLabel: "메모 (선택)",
    contentRequired: false,
    hasAudio: true,
  },
  notice: {
    category: "notice",
    label: "공지사항",
    path: "/news/notice",
    heroImage: "/images/hero-6.jpg",
    newLabel: "공지 쓰기",
    titleLabel: "제목",
    titleRequired: true,
    contentLabel: "내용",
    contentRequired: true,
    hasAudio: false,
  },
  gallery: {
    category: "gallery",
    label: "갤러리",
    path: "/news/gallery",
    heroImage: "/images/hero-4.jpg",
    newLabel: "앨범 만들기",
    titleLabel: "앨범 제목",
    titlePlaceholder: "예: 2026 추수감사절",
    titleRequired: true,
    contentLabel: "설명 (선택)",
    contentRequired: false,
    hasAudio: false,
    attachments: "images",
  },
  bulletin: {
    category: "bulletin",
    label: "주보",
    path: "/news/bulletin",
    heroImage: "/images/hero-2.jpg",
    newLabel: "주보 올리기",
    titleLabel: "제목 (선택)",
    titlePlaceholder: "비워 두면 날짜로 정해집니다 (예: 2026년 10월 4일 주보)",
    titleRequired: false,
    contentLabel: "메모 (선택)",
    contentRequired: false,
    hasAudio: false,
    attachments: "images+pdf",
  },
};

export function isBoardCategory(value: unknown): value is BoardCategory {
  return typeof value === "string" && value in boards;
}
