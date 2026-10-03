// 생명의 말씀 > 설교말씀: 예배실황·주일설교·수요설교 탭과 쪽 번호 (탭·쪽은 주소 ?tab=&page= 로 남긴다)
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import YouTubeMedia from "@/components/YouTubeMedia";
import { TABS } from "@/lib/sermonTabs";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab)?.key ?? TABS[0].key;
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  return (
    <>
      <Header />
      <main>
        <PageHeader path="/media" />
        <YouTubeMedia tab={tab} page={page} />
      </main>
      <Footer />
    </>
  );
}
