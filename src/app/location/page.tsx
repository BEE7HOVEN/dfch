// 교회 안내 > 오시는 길 페이지 (지도·주소·대중교통 안내)
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { CHURCH_ADDRESS, CHURCH_PHONE } from "@/lib/site";

const ROUTES = [
  {
    title: "산본역에서 오시는 길",
    steps: [
      "[산본역 3번 출구]로 나오셔서",
      "[주공2,3단지 아파트 입구] 정류장에서",
      "[19번 또는 30번 버스]를 타시고",
      "[삼성마을 1단지,이마트트레이더스]",
      "정류장에서 내리시면 됩니다.",
    ],
    note: "19분 정도 소요됩니다.",
  },
  {
    title: "군포역에서 오시는 길",
    steps: [
      "[군포역 1번출구]로 나오셔서",
      "[군포1동 행정복지센터,군포역] 정류장에서",
      "[20번 버스]를 타시고",
      "[삼성마을 1단지,이마트트레이더스]",
      "정류장에서 내리시면 됩니다.",
    ],
  },
];

export default function LocationPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader path="/location" />

        <section className="shell pb-20 md:pb-28">
          <div className="border-t-2 border-ink pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-10 lg:gap-14">
            <Image
              src="/images/service-map.jpeg"
              alt="드림숲교회 오시는 길 지도"
              width={1280}
              height={894}
              loading="eager"
              className="w-full h-auto rounded-[24px] border border-line"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div>
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm font-semibold text-forest">주소</dt>
                  <dd className="mt-2 text-lg md:text-xl font-bold text-ink">{CHURCH_ADDRESS} 드림숲교회</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-forest">문의</dt>
                  <dd className="mt-2 text-lg md:text-xl font-bold text-ink">
                    <a href={`tel:${CHURCH_PHONE}`} className="hover:text-forest">{CHURCH_PHONE}</a>
                  </dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`https://map.naver.com/p/search/${encodeURIComponent(CHURCH_ADDRESS)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
                >
                  네이버 지도 ↗
                </a>
                <a
                  href={`https://map.kakao.com/?q=${encodeURIComponent(CHURCH_ADDRESS)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-sub hover:border-forest hover:text-forest transition-colors"
                >
                  카카오맵 ↗
                </a>
              </div>
            </div>
          </div>

          <h2 className="mt-16 md:mt-20 text-[22px] md:text-[26px] font-bold text-ink">대중교통 이용안내</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {ROUTES.map((r) => (
              <div key={r.title} className="rounded-[24px] bg-paper p-7 md:p-9">
                <h3 className="text-lg font-bold text-ink">{r.title}</h3>
                <div className="mt-4 text-[15px] leading-[2] text-sub">
                  {r.steps.map((s) => (
                    <p key={s}>{s}</p>
                  ))}
                  {r.note && <p className="mt-2 font-semibold text-forest">{r.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
