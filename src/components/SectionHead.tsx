// 칸 제목 규칙: 작은 한글 이름표 + 큰 한글 제목 (+ 설명) + 오른쪽 전체보기 링크
import Link from "next/link";

export default function SectionHead({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "전체보기",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8 md:mb-10">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-forest">
          <span aria-hidden="true" className="h-px w-5 bg-forest" />
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[26px] md:text-[32px] font-bold leading-tight text-ink">{title}</h2>
        {description && <p className="mt-3 text-[15px] text-sub">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-sub hover:text-forest transition-colors"
        >
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
