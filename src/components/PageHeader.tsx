// 하위 페이지 머리: 경로(홈 › 상위 메뉴 › 현재 메뉴) + 왼쪽 큰 제목. 사진 띠 대신 쓴다.
import Link from "next/link";
import { findNavTrail } from "@/lib/nav";

export default function PageHeader({
  path,
  title,
  description,
}: {
  path: string; // 이 페이지가 속한 메뉴 주소 (예: "/news/bulletin")
  title?: string; // 비우면 메뉴 이름
  description?: string;
}) {
  const trail = findNavTrail(path);
  const heading = title ?? trail?.item.label ?? "";

  return (
    <div className="shell pt-8 md:pt-12 pb-8 md:pb-10">
      <nav aria-label="현재 위치" className="flex items-center gap-2 text-[13px] text-mute">
        <Link href="/" aria-label="처음으로" className="hover:text-forest">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
          </svg>
        </Link>
        {trail && (
          <>
            <span aria-hidden="true">›</span>
            <Link href={trail.group.children[0].href} className="hover:text-forest">
              {trail.group.label}
            </Link>
            <span aria-hidden="true">›</span>
            <Link href={trail.item.href} className="text-sub hover:text-forest">
              {trail.item.label}
            </Link>
          </>
        )}
      </nav>
      <h1 className="mt-4 text-[30px] md:text-[40px] font-bold leading-tight text-ink">{heading}</h1>
      <div className="mt-4 h-[3px] w-10 rounded-full bg-forest" />
      {description && <p className="mt-4 text-[15px] text-sub">{description}</p>}
    </div>
  );
}
