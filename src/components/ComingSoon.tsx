// 아직 내용이 없는 메뉴(주보·갤러리·공지사항)에 보여 주는 준비 중 화면
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export default function ComingSoon({
  title,
  image,
}: {
  title: string;
  image: string;
}) {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image={image} title={title} />
        <section className="py-28 md:py-40 px-4 text-center">
          <p className="text-lg text-[#404040]">준비 중입니다.</p>
          <p className="mt-3 text-sm text-[#999]">
            곧 새로운 소식으로 찾아뵙겠습니다.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
