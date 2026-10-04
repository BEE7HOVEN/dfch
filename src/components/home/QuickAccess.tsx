// 메인 바로가기: 처음 오신 분 안내(교회 소개·예배 안내·오시는 길) + 자주 찾는 메뉴 타일
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import { YOUTUBE_URL } from "@/lib/site";

const FIRST_VISIT = [
  { no: "01", title: "교회 소개", desc: "드림숲교회는 어떤 교회인가요", href: "/about" },
  { no: "02", title: "예배 안내", desc: "주일·수요 예배와 새벽묵상 시간", href: "/service" },
  { no: "03", title: "오시는 길", desc: "주소와 대중교통 안내", href: "/location" },
];

const MENUS = [
  { title: "설교말씀", desc: "주일·수요 설교와 예배 영상", href: "/media" },
  { title: "매일의 묵상", desc: "날마다 올라오는 묵상 녹음", href: "/meditation" },
  { title: "유튜브 채널", desc: "드림숲교회 영상 모음", href: YOUTUBE_URL, external: true },
  { title: "주보", desc: "이번 주 주보 보기", href: "/news/bulletin" },
  { title: "갤러리", desc: "예배와 행사 사진", href: "/news/gallery" },
  { title: "목회편지", desc: "담임목사님의 편지", href: "/letters" },
];

function Arrow() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

export default function QuickAccess() {
  return (
    <section className="py-16 md:py-24">
      <div className="shell">
        <SectionHead
          eyebrow="바로가기"
          title="어서 오세요, 드림숲입니다"
          description="처음 오신 분을 위한 안내와 자주 찾는 메뉴를 모았습니다."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 lg:gap-6">
          <div className="rounded-[24px] bg-mist p-6 md:p-7">
            <h3 className="text-lg font-bold text-ink">처음 오셨나요?</h3>
            <ul className="mt-5 space-y-2.5">
              {FIRST_VISIT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-4 rounded-2xl bg-white px-5 py-4 hover:shadow-[0_8px_24px_rgba(31,36,33,0.08)] transition-shadow"
                  >
                    <span className="text-sm font-semibold text-forest">{item.no}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-ink">{item.title}</span>
                      <span className="block text-sm text-mute truncate">{item.desc}</span>
                    </span>
                    <span className="text-mute group-hover:text-forest transition-colors">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 6개를 모두 같은 크기·같은 색 카드로 놓아 바둑판이 반듯하게 */}
          <ul className="grid grid-cols-2 md:grid-cols-3 auto-rows-fr gap-3 md:gap-4">
              {MENUS.map((m) => {
                const className =
                  "group h-full flex flex-col justify-between gap-6 rounded-[20px] border border-transparent bg-sage p-5 md:p-6 text-ink transition-colors hover:border-forest/30";
                const body = (
                  <>
                    <span className="self-end opacity-60 group-hover:opacity-100">
                      <Arrow />
                    </span>
                    <span>
                      <span className="block text-base md:text-lg font-bold">{m.title}</span>
                      <span className="mt-1 block text-[13px] text-sub">{m.desc}</span>
                    </span>
                  </>
                );
                return (
                  <li key={m.title}>
                    {m.external ? (
                      <a href={m.href} target="_blank" rel="noopener noreferrer" className={className}>
                        {body}
                      </a>
                    ) : (
                      <Link href={m.href} className={className}>
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </section>
  );
}
