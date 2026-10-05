// 교회 안내 > 예배 안내 페이지 (예배 시간)
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";

const SERVICES = [
  { name: "주일예배", day: "일요일", time: "오전 11시" },
  { name: "어린이예배", day: "일요일", time: "오전 11시" },
  { name: "수요예배", day: "수요일", time: "저녁 7시 30분" },
  { name: "새벽묵상", day: "매일 (온라인)", time: "오전 6시" },
];

export default function ServicePage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader path="/service" />

        <section className="shell pb-20 md:pb-28">
          <div className="border-t-2 border-ink pt-10 md:pt-14">
            <h2 className="text-[22px] md:text-[26px] font-bold text-ink">예배시간</h2>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {SERVICES.map((s) => (
                <li key={s.name} className="rounded-[24px] bg-mist p-7 md:p-9">
                  <p className="text-sm font-semibold text-forest">{s.name}</p>
                  <p className="mt-5 text-[28px] md:text-[32px] font-bold leading-none text-ink">{s.time}</p>
                  <p className="mt-3 text-[15px] text-sub">{s.day}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/location" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-forest-deep transition-colors">
                오시는 길 보기
              </Link>
              <Link href="/media" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-sub hover:border-forest hover:text-forest transition-colors">
                설교말씀 다시 보기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
