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
    <section className="pt-8 md:pt-12">
      <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_clamp(320px,30vw,420px)] gap-4 lg:gap-6 lg:h-[480px]">
        <div className="aspect-[19/10] lg:aspect-auto lg:h-full">
          <BannerSlider items={banners} />
        </div>
        <SermonCard />
      </div>
    </section>
  );
}
