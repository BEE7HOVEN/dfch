// 교회 안내 > 오시는 길 페이지 (지도·주소·대중교통 안내)
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Image from "next/image";

export default function LocationPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image="/images/service-hero.jpg" title="오시는 길" />

        <section className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <Image
                src="/images/service-map.jpeg"
                alt="오시는 길"
                width={800}
                height={500}
                className="w-full rounded-lg"
              />
            </div>

            <div className="space-y-4 text-base leading-[2] text-[#404040] mb-16">
              <p>
                <strong>주소</strong>
                <br />
                경기도 군포시 삼성로69번길 13 드림숲교회
              </p>
              <p>
                <strong>문의</strong> : 010-3360-6818
              </p>
            </div>

            <h3 className="text-xl font-light text-center mb-10 text-[#404040]">
              대중교통 이용안내
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-4">산본역에서 오시는 길</h4>
                <div className="text-sm leading-[2] text-[#666]">
                  <p>[산본역 3번 출구]로 나오셔서</p>
                  <p>[주공2,3단지 아파트 입구] 정류장에서</p>
                  <p>[19번 또는 30번 버스]를 타시고</p>
                  <p>[삼성마을 1단지,이마트트레이더스]</p>
                  <p>정류장에서 내리시면 됩니다.</p>
                  <p className="mt-2 text-[#404040]">19분 정도 소요됩니다.</p>
                </div>
              </div>

              <div className="p-8 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-4">군포역에서 오시는 길</h4>
                <div className="text-sm leading-[2] text-[#666]">
                  <p>[군포역 1번출구]로 나오셔서</p>
                  <p>[군포1동 행정복지센터,군포역] 정류장에서</p>
                  <p>[20번 버스]를 타시고</p>
                  <p>[삼성마을 1단지,이마트트레이더스]</p>
                  <p>정류장에서 내리시면 됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
