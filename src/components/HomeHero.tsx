// 메인 첫 화면: 왼쪽 행사 배너(관리자 등록, 기간 안의 것만) + 오른쪽 주일설교 카드
import BannerSlider, { type BannerItem } from "@/components/BannerSlider";
import SermonCard from "@/components/SermonCard";
import { getActiveBanners, getAlbumCovers } from "@/lib/posts";
import { seoulToday } from "@/lib/format";

// DB를 못 읽으면 배너 없이(교회 사진으로) 보여 준다.
async function loadBanners(): Promise<BannerItem[]> {
  try {
    const banners = await getActiveBanners(seoulToday());
    const covers = await getAlbumCovers(banners.map((b) => b.id)); // 글마다 첫 사진
    return banners.flatMap((b) => {
      const cover = covers.get(b.id)?.cover;
      if (!cover) return [];
      return [{ id: b.id, title: b.title, imageUrl: `/r2/${cover.file_key}`, linkUrl: b.link_url }];
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function HomeHero() {
  const banners = await loadBanners();

  return (
    <section className="pt-20 md:pt-24 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.65fr_1fr] gap-4 md:gap-5 md:h-[480px]">
        <div className="aspect-[4/3] md:aspect-auto md:h-full">
          <BannerSlider items={banners} />
        </div>
        <SermonCard />
      </div>
    </section>
  );
}
