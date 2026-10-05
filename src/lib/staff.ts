// 섬기는 분들 페이지에 나올 교역자·장로 명단. 사진이 오면 photo에 /images/staff/ 아래 파일 경로만 적으면 된다.

export interface StaffMember {
  role: string; // 직분
  name: string;
  photo?: string; // 예: "/images/staff/kim.jpg" (비우면 빈 자리 그림이 나온다)
}

export interface StaffGroup {
  title: string;
  members: StaffMember[];
}

// 이름은 2026-10-05 확정된 값이다 (원로목사는 넣지 않기로 함).
export const staffGroups: StaffGroup[] = [
  {
    title: "교역자",
    members: [
      { role: "부목사", name: "서문동수" },
      { role: "협동목사", name: "전익주" },
      { role: "교육간사", name: "박인혜" },
    ],
  },
  {
    title: "시무장로",
    members: [
      { role: "시무장로", name: "조종수" },
      { role: "시무장로", name: "이충영" },
      { role: "시무장로", name: "이원종" },
    ],
  },
];
