// 교회 안내 > 섬기는 분들 페이지 (담임목사 인사말 + 교역자·장로)
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import StaffGrid from "@/components/StaffGrid";
import Image from "next/image";

export default function PastorPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader path="/pastor" />

        <section className="shell pb-20 md:pb-28">
          <div className="border-t-2 border-ink pt-10 md:pt-14">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 lg:gap-20 items-start">
              <div>
                <Image
                  src="/images/pastor-photo.jpeg"
                  alt="담임목사 조성호"
                  width={300}
                  height={300}
                  loading="eager"
                  className="rounded-[24px] w-full max-w-[420px]"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
                <p className="mt-5 text-sm font-semibold text-forest">담임목사</p>
                <p className="mt-1 text-2xl font-bold text-ink">조성호</p>
              </div>

              <div className="space-y-6 text-base md:text-[17px] leading-[2] text-sub">
                <h2 className="text-[22px] md:text-[28px] font-bold leading-snug text-ink">담임목사가 드리는 편지</h2>
                <p>
                  드림숲교회에 오신 여러분을 환영합니다.
                </p>

                <p>
                  하나님의 은혜로,
                  <br />
                  사계절의 아름다움이 머무는 이 숲 속에
                  <br />
                  예배당이 세워졌습니다.
                </p>

                <p>
                  바람이 지나가고 햇살이 머무는 자연 속에서,
                  <br />
                  자신을 드러내시는 하나님의 살아계심을
                  <br />
                  더 깊이 느끼며 예배할 수 있음에 감사드립니다.
                </p>

                <p>
                  예수 그리스도는
                  <br />
                  죄인된 우리 모두를 사랑하십니다.
                </p>

                <p>
                  하나님의 본체이신 그분은
                  <br />
                  육신을 입고 이 땅에 오셔서
                  <br />
                  우리를 위해 죽으시고 다시 살아나셨습니다.
                  <br />
                  그리고 그 복음의 이야기는 지금도 계속되고 있습니다.
                </p>

                <p>
                  드림숲교회 공동체는
                  <br />
                  그분이 다시 오실 날을 기다리며,
                  <br />
                  예수 그리스도의 동역자로
                  <br />
                  여러분과 함께 하나님 나라를
                  <br />
                  이루어가기를 간절히 소망합니다.
                </p>

                <p>
                  삶의 무게와 시대의 아픔 속에 있는 여러분,
                  <br />
                  하나님은 태초부터 여러분을 계획하셨고,
                  <br />
                  깊은 상처 속에 있는 마음도
                  <br />
                  결코 외면하지 않으십니다.
                </p>

                <p>
                  이제, 위로와 사랑으로 초대하시는
                  <br />
                  그 분의 성찬에 함께 참여 하시기를
                  <br />
                  기쁨으로 초청합니다.
                </p>

                <p className="text-right mt-8 font-semibold text-ink">
                  담임목사 &nbsp;조 성 호
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="shell pb-20 md:pb-28">
          <div className="border-t-2 border-ink pt-10 md:pt-14">
            <h2 className="text-[22px] md:text-[28px] font-bold leading-snug text-ink">함께 섬기는 분들</h2>
            <div className="mt-10 md:mt-12">
              <StaffGrid />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
