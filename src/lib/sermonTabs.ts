// 설교말씀 탭 목록 (서버 페이지와 영상 목록 컴포넌트가 함께 쓴다)
export type VideoCategory = "live" | "sunday" | "wednesday";

export const TABS: { key: VideoCategory; label: string }[] = [
  { key: "live", label: "예배실황" },
  { key: "sunday", label: "주일설교" },
  { key: "wednesday", label: "수요설교" },
];
