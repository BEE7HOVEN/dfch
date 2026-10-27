// 초청음악회 예매 페이지: 남은 좌석을 보여 주고 이름·연락처·인원을 받는다.
import type { Metadata } from "next";
import { BASE_OPEN_GRAPH, pageMetadata } from "@/lib/pageMetadata";
import { CAPACITY, CONCERT_AT_LABEL, LOW_SEATS, getSeatStatus } from "@/lib/concert";
import { CHURCH_ADDRESS, SITE_NAME } from "@/lib/site";
import ConcertForm from "./ConcertForm";

const TITLE = "초청음악회 예매";
const DESCRIPTION = "드림숲교회 초청음악회 예매 안내입니다. 남은 좌석을 확인하고 예매하세요.";
export const metadata: Metadata = {
  ...pageMetadata("/concert", DESCRIPTION),
  title: TITLE,
  openGraph: { ...BASE_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: "/concert" },
};

export const dynamic = "force-dynamic";

export default async function ConcertPage() {
  const status = await getSeatStatus();
  const filled = CAPACITY - status.remaining; // 현장 몫 + 예매된 인원
  const soldOut = status.remaining === 0;

  return (
    // 예매 링크만 단독으로 보이게: 머리글·바닥글·메뉴 없이 예매에 필요한 것만 둔다.
    <main className="min-h-screen">
      <section className="mx-auto w-full max-w-[560px] px-5 py-10 md:py-14">
        <div className="space-y-8">
          <header>
            <p className="text-[13px] font-semibold tracking-wide text-forest">{SITE_NAME}</p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight text-ink md:text-[32px]">초청음악회 예매</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-sub">
              {CONCERT_AT_LABEL}
              <br />
              {CHURCH_ADDRESS}
              <br />
              예매는 12월 5일 정오까지 받습니다.
            </p>
          </header>
          <div className="space-y-8">
            <div className="rounded-2xl bg-mist p-6 md:p-7">
              <div className="flex items-end justify-between">
                <p className="text-[15px] text-sub">남은 좌석</p>
                <p className="text-[32px] font-bold leading-none text-forest">
                  {status.remaining}
                  <span className="ml-1 text-[16px] font-medium text-sub">/ {CAPACITY}석</span>
                </p>
              </div>
              <div
                className="mt-4 h-2.5 overflow-hidden rounded-full bg-white"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={CAPACITY}
                aria-valuenow={filled}
                aria-label="예매된 좌석"
              >
                <div className="h-full rounded-full bg-forest" style={{ width: `${(filled / CAPACITY) * 100}%` }} />
              </div>
              <p className="mt-3 text-[13px] text-mute">좌석은 지정하지 않습니다.</p>
              {status.remaining > 0 && status.remaining <= LOW_SEATS && !status.closed && (
                <p className="mt-2 text-[14px] font-semibold text-forest">얼마 남지 않았습니다. 서둘러 예매해 주세요.</p>
              )}
            </div>

            {status.closed || soldOut ? (
              <div className="rounded-2xl border border-line p-8 text-center">
                <h2 className="text-[22px] font-bold text-ink">
                  {soldOut && !status.closed ? "온라인 예매 좌석이 모두 찼습니다" : "예매가 마감되었습니다"}
                </h2>
                <p className="mt-3 text-[15px] text-sub">
                  현장 접수나 문의는 교회(031-421-6191)로 연락해 주세요.
                </p>
              </div>
            ) : (
              <ConcertForm remaining={status.remaining} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
