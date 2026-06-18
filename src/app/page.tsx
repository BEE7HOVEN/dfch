import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSlideshow />

        <section className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="space-y-8 text-base md:text-lg leading-[2] text-[#404040]">
              <p>
                드림숲교회는
                <br />
                대한예수교장로회 합동측 교단
                <br />
                경성노회 북부시찰에 속해 있는 교회입니다.
              </p>

              <p>
                우리 교회는 전 교인이 함께
                <br />
                같은 성경본문을 매일 함께
                <br />
                묵상하며 나누는 것이 좋은 전통으로 있습니다.
              </p>

              <p>
                함께 성경 66권 모두를 읽어가며,
                <br />
                말씀을 나누고 삶에 적용하며
              </p>

              <p>
                그리스도 예수를 한 절이라도
                <br />
                따라 살아가려고 애쓰는 이들이 모여있습니다.
              </p>

              <p>
                담임목사님의 설교말씀은
                <br />
                함께 묵상하는 본문의 순서를 기초로 합니다.
              </p>
            </div>

            <div className="mt-16">
              <Image
                src="/images/main-intro.png"
                alt="드림숲교회"
                width={738}
                height={506}
                className="mx-auto rounded-lg"
              />
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div key={n} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={`/images/hero-${n}.jpg`}
                    alt={`드림숲교회 ${n}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
