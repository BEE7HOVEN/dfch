// 메인 맨 위 교회 소개: 큰 건물 사진 슬라이드 위에 교회 소개 요약과 교회 소개/오시는 길 버튼 (예배 시간은 바닥글에 있어 넣지 않는다)
import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";

export default function AboutChurch() {
  return (
    <HeroSlideshow className="relative h-[680px] md:h-[80vh] md:min-h-[600px] w-full overflow-hidden">
      <div className="shell h-full flex items-end md:items-center pb-16 md:pb-0">
        <div className="max-w-xl text-white">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
            <span aria-hidden="true" className="h-px w-5 bg-white/60" />
            드림숲교회
          </p>
          <h2 className="mt-3 text-[30px] md:text-[44px] font-bold leading-tight">
            말씀이 삶이 되고
            <br />
            섬김이 되는 공동체
          </h2>
          <p className="mt-5 text-[15px] md:text-[17px] leading-[1.9] text-white/85">
            대한예수교장로회 합동측 경성노회에 속한 교회입니다.
            <br className="hidden md:block" /> 온 교인이 같은 성경 본문을 날마다 함께 묵상하고 나누며,
            <br className="hidden md:block" /> 그리스도 예수를 한 절이라도 따라 살아가려 애씁니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/about" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-forest hover:bg-mist transition-colors">
              교회 소개 보기
            </Link>
            <Link href="/location" className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              오시는 길
            </Link>
          </div>
        </div>
      </div>
    </HeroSlideshow>
  );
}
