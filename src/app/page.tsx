import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import ChurchIntro from "@/components/ChurchIntro";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSlideshow />

        <ChurchIntro />

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
