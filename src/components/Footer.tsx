// 사이트 바닥글: 교회 정보(주소·전화·예배 시간)와 전체 메뉴
import Link from "next/link";
import Image from "next/image";
import { navGroups } from "@/lib/nav";
import { CHURCH_ADDRESS, CHURCH_PHONE, YOUTUBE_URL } from "@/lib/site";

const SERVICE_TIMES = [
  { name: "주일예배", time: "일요일 오전 11시" },
  { name: "어린이예배", time: "일요일 오전 11시" },
  { name: "수요예배", time: "수요일 저녁 7시 30분" },
  { name: "새벽묵상", time: "매일 오전 6시 (온라인)" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-forest-deep text-white/75">
      <div className="shell py-14 md:py-16">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          <div>
            <Image
              src="/images/logo-light.png"
              alt="드림숲교회"
              width={132}
              height={47}
              className="w-[132px] h-auto brightness-0 invert"
            />
            <dl className="mt-6 space-y-1.5 text-sm">
              <div className="flex gap-3">
                <dt className="w-10 shrink-0 text-white/45">주소</dt>
                <dd>{CHURCH_ADDRESS}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-10 shrink-0 text-white/45">전화</dt>
                <dd>
                  <a href={`tel:${CHURCH_PHONE}`} className="hover:text-white">
                    {CHURCH_PHONE}
                  </a>
                </dd>
              </div>
            </dl>
            <ul className="mt-6 flex flex-wrap gap-3">
              {SERVICE_TIMES.map((s) => (
                <li key={s.name} className="rounded-xl bg-white/5 px-4 py-3 whitespace-nowrap">
                  <p className="text-xs text-white/45">{s.name}</p>
                  <p className="mt-1 text-sm text-white/90">{s.time}</p>
                </li>
              ))}
            </ul>
          </div>

          <nav className="grid grid-cols-3 gap-8 md:gap-16">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-sm font-semibold text-white">{group.label}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.children.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-white/40">
          <p>&copy; 드림숲교회 · 대한예수교장로회</p>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            유튜브 채널 ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
