import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export default function ServicePage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image="/images/service-hero.jpg" title="예배안내" />

        <section className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-center mb-16 text-[#404040]">
              예배시간
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center p-8 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-medium mb-2">주일예배</h3>
                <p className="text-[#666]">일요일 오전 11시</p>
              </div>
              <div className="text-center p-8 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-medium mb-2">수요예배</h3>
                <p className="text-[#666]">수요일 저녁 7시 30분</p>
              </div>
              <div className="text-center p-8 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-medium mb-2">새벽묵상</h3>
                <p className="text-[#666]">매일 오전 6시 (온라인)</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
