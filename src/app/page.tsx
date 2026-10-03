import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import HeroSlideshow from "@/components/HeroSlideshow";
import ChurchIntro from "@/components/ChurchIntro";
import HomeRecentPosts from "@/components/HomeRecentPosts";
import HomeRecentAlbums from "@/components/HomeRecentAlbums";
import Image from "next/image";

// 배너·최근 공지·묵상·앨범을 보여 주므로 5분마다 새로 만든다. 관리자가 글을 바꾸면 그 즉시 갱신된다(actions.ts).
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HomeHero />

        <HeroSlideshow />

        <HomeRecentPosts />

        <HomeRecentAlbums />

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
