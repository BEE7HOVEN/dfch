"use client";
// 사이트 머리글. PC는 메뉴에 올리면 세 묶음이 함께 펼쳐지는 넓은 메뉴판, 휴대폰은 오른쪽에서 열리는 메뉴판. 머리글 높이만큼 빈 칸도 함께 둔다.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { findNavTrail, navGroups } from "@/lib/nav";
import { YOUTUBE_URL } from "@/lib/site";

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#e53935"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"
      />
      <path fill="#fff" d="M9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
    </svg>
  );
}

// 상위 메뉴 칸과 펼친 메뉴판의 열이 같은 폭이어야 세로줄이 맞는다.
const COLUMN = "w-[156px] xl:w-[176px]";

export default function Header() {
  const pathname = usePathname();
  const trail = findNavTrail(pathname);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 조금이라도 내려가면 머리글 아래에 그림자를 둔다.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 다른 페이지로 옮겨 가면 펼친 메뉴를 닫는다.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMegaOpen(false);
    setMenuOpen(false);
  }

  // 휴대폰 메뉴판이 열린 동안 뒤 페이지가 스크롤되지 않게 한다.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMega = () => {
    setMegaOpen(false);
    setHovered(null);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-white transition-shadow ${
          scrolled || megaOpen ? "shadow-[0_1px_0_var(--color-line),0_8px_24px_rgba(31,36,33,0.06)]" : "shadow-[0_1px_0_var(--color-line)]"
        }`}
        onMouseLeave={closeMega}
        onKeyDown={(e) => e.key === "Escape" && closeMega()}
      >
        <div className="shell h-[68px] md:h-[88px] grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/" className="justify-self-start" aria-label="드림숲교회 처음으로">
            <Image
              src="/images/logo-dark.png"
              alt="드림숲교회"
              width={200}
              height={72}
              loading="eager"
              className="w-[124px] md:w-[150px] h-auto"
            />
          </Link>

          <nav
            className="hidden lg:flex h-full"
            aria-label="주 메뉴"
            onMouseEnter={() => setMegaOpen(true)}
            onFocus={() => setMegaOpen(true)}
          >
            {navGroups.map((group) => {
              const active = trail?.group.label === group.label;
              const lit = hovered ? hovered === group.label : active;
              return (
                <Link
                  key={group.label}
                  href={group.children[0].href}
                  onMouseEnter={() => setHovered(group.label)}
                  onFocus={() => setHovered(group.label)}
                  aria-current={active ? "page" : undefined}
                  className={`${COLUMN} relative h-full flex items-center justify-center text-[17px] font-semibold tracking-[-0.01em] transition-colors ${
                    lit ? "text-forest" : "text-ink"
                  }`}
                >
                  {group.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-forest transition-all duration-300 ${
                      lit ? "w-10" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex justify-self-end">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-sub hover:bg-mist hover:text-forest transition-colors"
            >
              <YoutubeIcon className="w-5 h-5" />
              유튜브 채널
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden justify-self-end -mr-2 p-2 text-ink"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M10 17h10" />
            </svg>
          </button>
        </div>

        {/* PC 펼친 메뉴판: 상위 메뉴와 같은 열 폭으로 하위 메뉴를 세로로 늘어놓는다. */}
        <div
          className={`hidden lg:block absolute inset-x-0 top-full bg-white border-t border-line shadow-[0_16px_32px_rgba(31,36,33,0.08)] transition-all duration-200 ${
            megaOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="shell grid grid-cols-[1fr_auto_1fr] py-8">
            <div className="pr-10 self-start">
              <p className="text-[15px] font-bold text-forest">드림숲교회</p>
              <p className="mt-2 text-[15px] leading-relaxed text-sub">
                같은 본문을 날마다
                <br />
                함께 묵상하는 교회
              </p>
            </div>
            <div className="flex">
              {navGroups.map((group) => (
                <ul
                  key={group.label}
                  onMouseEnter={() => setHovered(group.label)}
                  className={`${COLUMN} border-l border-line first:border-l-0 text-center space-y-1`}
                >
                  {group.children.map((item) => {
                    const current = trail?.item.href === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={closeMega}
                          aria-current={current ? "page" : undefined}
                          className={`inline-block rounded-lg px-3 py-2 text-[15px] transition-colors hover:text-forest hover:bg-mist ${
                            current ? "font-semibold text-forest" : "text-sub"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
            <div />
          </div>
        </div>
      </header>
      {/* 고정된 머리글 높이만큼 내용이 밀려 내려오게 하는 빈 칸 */}
      <div className="h-[68px] md:h-[88px]" aria-hidden="true" />

      {/* 휴대폰·태블릿 메뉴판 */}
      <div
        className={`lg:hidden fixed inset-0 z-[70] transition-[visibility] ${menuOpen ? "visible" : "invisible delay-300"}`}
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
          aria-label="메뉴 닫기"
        />
        <div
          className={`absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-[68px] md:h-[88px] px-6 flex items-center justify-between border-b border-line">
            <Image src="/images/logo-dark.png" alt="" width={200} height={72} className="w-[104px] h-auto" />
            <button
              type="button"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="-mr-2 p-2 text-ink"
              aria-label="메뉴 닫기"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-2" aria-label="전체 메뉴">
            {navGroups.map((group) => (
              <div key={group.label} className="py-5 border-b border-line last:border-b-0">
                <p className="text-[13px] font-semibold tracking-wide text-forest">{group.label}</p>
                <ul className="mt-2">
                  {group.children.map((item) => {
                    const current = trail?.item.href === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          tabIndex={menuOpen ? 0 : -1}
                          onClick={() => setMenuOpen(false)}
                          aria-current={current ? "page" : undefined}
                          className={`flex items-center justify-between py-2.5 text-[18px] ${
                            current ? "font-semibold text-forest" : "text-ink"
                          }`}
                        >
                          {item.label}
                          <span aria-hidden="true" className="text-mute text-base">›</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="px-6 py-5 border-t border-line">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              className="flex items-center justify-center gap-2 rounded-xl bg-paper py-3.5 text-sm font-medium text-sub"
            >
              <YoutubeIcon className="w-5 h-5" />
              유튜브 채널
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
