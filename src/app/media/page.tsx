import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YouTubeMedia from "@/components/YouTubeMedia";

export default function MediaPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/hero-7.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-3xl md:text-4xl text-white font-light tracking-wider">
              미디어
            </h1>
          </div>
        </section>

        <YouTubeMedia />
      </main>
      <Footer />
    </>
  );
}
