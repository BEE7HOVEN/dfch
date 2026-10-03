// 교회 소개 페이지의 소개 글과 대표 사진
import Image from "next/image";

export default function ChurchIntro() {
  return (
    <section className="shell pb-16 md:pb-24">
      <div className="border-t-2 border-ink pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <p className="text-[22px] md:text-[28px] font-bold leading-snug text-ink">
            그리스도 예수를 한 절이라도
            <br />
            따라 살아가려 애쓰는 교회
          </p>
          <div className="mt-8 space-y-6 text-base md:text-[17px] leading-[2] text-sub">
            <p>
              드림숲교회는 대한예수교장로회 합동측 교단
              <br className="hidden md:block" /> 경성노회 북부시찰에 속해 있는 교회입니다.
            </p>
            <p>
              우리 교회는 전 교인이 함께 같은 성경본문을 매일 함께
              <br className="hidden md:block" /> 묵상하며 나누는 것이 좋은 전통으로 있습니다.
            </p>
            <p>
              함께 성경 66권 모두를 읽어가며, 말씀을 나누고 삶에 적용하며
              <br className="hidden md:block" /> 그리스도 예수를 한 절이라도 따라 살아가려고 애쓰는 이들이 모여있습니다.
            </p>
            <p>담임목사님의 설교말씀은 함께 묵상하는 본문의 순서를 기초로 합니다.</p>
          </div>
        </div>
        <Image
          src="/images/main-intro.png"
          alt="드림숲교회"
          width={1476}
          height={1012}
          loading="eager"
          className="w-full h-auto rounded-[24px]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}
