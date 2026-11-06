// 초청장 보내기: 교인이 이름을 넣어 초청장 링크를 만들고 카카오톡 등으로 보낸다.
// 받는 사람이 보는 화면(/concert/invite)과 분리해, 여기에는 포스터·영상 없이 이름 입력만 둔다.
import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/lib/pageMetadata";
import { SITE_NAME } from "@/lib/site";
import SendForm from "./SendForm";

const TITLE = "초대장 보내기 · 3인 초청음악회";
const DESCRIPTION = "이름을 넣어 지인에게 3인 초청음악회 초대장을 보내세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false }, // 교인용 도구 페이지라 검색에는 나오지 않게 한다
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/concert/og.jpg", width: 1200, height: 630, alt: "3인 초청음악회 포스터" }],
  },
};

export default function SendPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-[560px] space-y-5 px-5 py-8 md:py-12">
        <p className="text-center text-[13px] font-semibold tracking-wide text-forest">{SITE_NAME}</p>
        <SendForm />
      </div>
    </main>
  );
}
