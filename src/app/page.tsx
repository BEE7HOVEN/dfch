import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import QuickAccess from "@/components/home/QuickAccess";
import ThisWeek from "@/components/home/ThisWeek";
import WordWorship from "@/components/home/WordWorship";
import RecentAlbums from "@/components/home/RecentAlbums";
import RecentMeditations from "@/components/home/RecentMeditations";
import AboutChurch from "@/components/home/AboutChurch";

// 배너·최근 주보·공지·묵상·앨범을 보여 주므로 5분마다 새로 만든다. 관리자가 글을 바꾸면 그 즉시 갱신된다(actions.ts).
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* 첫 화면: 큰 교회 사진 위 교회 소개 */}
        <AboutChurch />
        <HomeHero />
        <QuickAccess />
        <ThisWeek />
        <WordWorship>
          <RecentMeditations />
        </WordWorship>
        <RecentAlbums />
      </main>
      <Footer />
    </>
  );
}
