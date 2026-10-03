// 교회 안내 > 교회 소개 페이지
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ChurchIntro from "@/components/ChurchIntro";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image="/images/hero-1.jpg" title="교회 소개" />
        <ChurchIntro />
      </main>
      <Footer />
    </>
  );
}
