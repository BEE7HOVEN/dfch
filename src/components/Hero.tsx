// 헤더 아래에 들어가는 페이지 상단 히어로 이미지 (서브 비주얼).
// 페이지에서 <main className="pt-16"> 안에 넣어 헤더와 겹치지 않게 한다.
export default function Hero({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative h-[200px] md:h-[240px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {subtitle && (
          <p className="text-sm text-white/80 mb-2">{subtitle}</p>
        )}
        <h1 className="text-2xl md:text-3xl text-white font-light tracking-wider leading-snug max-w-2xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
