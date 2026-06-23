import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import YouTubeMedia from "@/components/YouTubeMedia";

export default function MediaPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image="/images/hero-7.jpg" title="설교말씀" />

        <YouTubeMedia />
      </main>
      <Footer />
    </>
  );
}
