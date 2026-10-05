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

// 이름은 주보와 영상 자막에서 찾은 임시 값이다. 확정되면 고친다.
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
    title: "장로",
    members: [
      { role: "장로", name: "조종수" },
      { role: "장로", name: "이충영" },
      { role: "장로", name: "이원종" },
    ],
  },
];
