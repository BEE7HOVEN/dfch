// 모바일 초청장: 교인이 카카오톡으로 지인에게 보내는 페이지. 포스터와 영상을 보여 주고 예매로 연결한다.
// 주소 뒤 ?from=이름 이 있으면 "OOO님이 초대합니다"로 보인다 (이름은 저장하지 않는다).
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/lib/pageMetadata";
import { cleanInviteName } from "@/lib/inviteName";
import { CHURCH_ADDRESS, CHURCH_PHONE, SITE_NAME } from "@/lib/site";
import { CONCERT_AT_LABEL } from "@/lib/concertConfig";
import InviteShare from "./InviteShare";

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const DESCRIPTION = "12월 5일(토) 오후 4시 · 군포 드림숲교회 포레스트홀 · 전석 무료";

// 보내는 사람(from)과 받는 사람(to)에 따라 문구가 달라진다. 둘 다 없으면 기본 문구.
function inviteTitle(from: string, to: string): string {
  if (from && to) return `${from}님이 ${to}님을 초대합니다 · 3인 초청음악회`;
  if (from) return `${from}님이 초대합니다 · 3인 초청음악회`;
  if (to) return `${to}님을 초대합니다 · 3인 초청음악회`;
  return "3인 초청음악회에 초대합니다";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const from = cleanInviteName(params.from);
  const to = cleanInviteName(params.to);
  const title = inviteTitle(from, to);
  return {
    title,
    description: DESCRIPTION,
    // 이름이 붙은 링크는 검색에 따로 잡히지 않게 하고, 대표 주소를 따로 지정하지 않아 카카오톡 카드에 이름이 그대로 보이게 한다.
    robots: from || to ? { index: false } : undefined,
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title,
      description: DESCRIPTION,
      images: [{ url: "/concert/og.jpg", width: 1200, height: 630, alt: "3인 초청음악회 포스터" }],
    },
  };
}

export default async function InvitePage({ searchParams }: Props) {
  const params = await searchParams;
  const from = cleanInviteName(params.from);
  const to = cleanInviteName(params.to);

  return (
    <main className="min-h-screen bg-paper pb-28">
      <div className="mx-auto w-full max-w-[560px] space-y-6 px-5 py-8 md:py-12">
        <header className="text-center">
          <p className="text-[13px] font-semibold tracking-wide text-forest">{SITE_NAME}</p>
          <h1 className="mt-2 text-[26px] font-bold leading-snug text-ink md:text-[30px]">
            {from && to ? (
              <>
                <span className="text-forest">{from}</span>님이
                <br />
                <span className="text-forest">{to}</span>님을 초대합니다
              </>
            ) : from ? (
              <>
                <span className="text-forest">{from}</span>님이
                <br />
                초대합니다
              </>
            ) : to ? (
              <>
                <span className="text-forest">{to}</span>님을
                <br />
                초대합니다
              </>
            ) : (
              "초대합니다"
            )}
          </h1>
          <p className="mt-3 text-[15px] text-sub">군포 지역주민을 위한 3인 초청음악회</p>
        </header>

        <Image
          src="/concert/poster.jpg"
          alt="3인 초청음악회 포스터: 소프라노 김성혜, 바리톤 김지욱, 뮤지컬배우 표정범. 12월 5일(토) 오후 4시, 군포 드림숲교회 포레스트홀, 전석 무료"
          width={1240}
          height={1754}
          sizes="(max-width: 560px) 100vw, 520px"
          priority
          className="w-full rounded-2xl shadow-sm"
        />

        <section className="rounded-2xl bg-white p-6 text-[15px] leading-relaxed text-ink">
          <dl className="space-y-3">
            <div className="flex gap-4">
              <dt className="w-12 shrink-0 text-mute">일시</dt>
              <dd className="font-semibold">{CONCERT_AT_LABEL}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-12 shrink-0 text-mute">장소</dt>
              <dd>
                <b>군포 드림숲교회 포레스트홀</b>
                <br />
                {CHURCH_ADDRESS}
                <br />
                <span className="text-sub">군포 이마트 트레이더스 건너편 길 따라</span>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-12 shrink-0 text-mute">입장</dt>
              <dd>
                <b>전석 무료</b> <span className="text-sub">· 온라인 예매, 현장 예매 모두 가능</span>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-12 shrink-0 text-mute">문의</dt>
              <dd>
                <a href={`tel:${CHURCH_PHONE.replaceAll("-", "")}`} className="font-semibold text-forest">
                  {CHURCH_PHONE}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        {/* 포스터와 같은 폭으로 꽉 채운다 */}
        <section>
          <h2 className="mb-3 text-center text-[18px] font-bold text-ink">영상으로 만나 보세요</h2>
          <video
            className="w-full rounded-2xl bg-black shadow-sm"
            controls
            playsInline
            preload="none"
            poster="/concert/invite-poster.jpg"
          >
            <source src="/concert/invite.mp4" type="video/mp4" />
            영상을 볼 수 없는 기기입니다.
          </video>
        </section>

        <InviteShare />
      </div>

      {/* 아래에 고정된 예매 버튼: 어디까지 내려 보든 바로 누를 수 있게 한다 */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto max-w-[560px]">
          <Link
            href="/concert"
            className="flex h-13 items-center justify-center rounded-xl bg-forest text-[17px] font-bold text-white active:bg-forest-deep"
          >
            지금 예매하기
          </Link>
        </div>
      </div>
    </main>
  );
}
