// 헤더·푸터가 함께 쓰는 사이트 메뉴 구조 (상위 메뉴 → 하위 메뉴).
export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  children: NavLink[];
}

export const navGroups: NavGroup[] = [
  {
    label: "교회 안내",
    children: [
      { label: "교회 소개", href: "/about" },
      { label: "섬기는 분들", href: "/pastor" },
      { label: "예배 안내", href: "/service" },
      { label: "오시는 길", href: "/location" },
    ],
  },
  {
    label: "생명의 말씀",
    children: [
      { label: "설교말씀", href: "/media" },
      { label: "매일의 묵상", href: "/meditation" },
      { label: "목회편지", href: "/letters" },
    ],
  },
  {
    label: "교회소식",
    children: [
      { label: "주보", href: "/news/bulletin" },
      { label: "갤러리", href: "/news/gallery" },
      { label: "공지사항", href: "/news/notice" },
    ],
  },
];

// 주소로 상위 메뉴·하위 메뉴를 찾는다 (페이지 머리의 경로 표시용). 본문 주소(/letters/123)는 목록 메뉴로 찾는다.
export function findNavTrail(
  path: string,
): { group: NavGroup; item: NavLink } | null {
  for (const group of navGroups) {
    const item = group.children.find(
      (c) => path === c.href || path.startsWith(`${c.href}/`),
    );
    if (item) return { group, item };
  }
  return null;
}
