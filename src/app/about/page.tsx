// 교회 안내 > 교회 소개 페이지 (소개 글 + 교회 사진 바둑판)
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import ChurchIntro from "@/components/ChurchIntro";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader path="/about" />
        <ChurchIntro />

        <section className="shell pb-20 md:pb-28">
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <li key={n} className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-paper">
                <Image
                  src={`/images/hero-${n}.jpg`}
                  alt={`드림숲교회 ${n}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
