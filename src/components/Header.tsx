"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { navGroups } from "@/lib/nav";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-dark.png"
            alt="드림숲교회"
            width={120}
            height={43}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10 h-full">
          {navGroups.map((group) => (
            // 마우스를 올리거나 키보드로 들어오면 하위 메뉴가 펼쳐진다.
            <div key={group.label} className="group relative h-full flex items-center">
              <Link
                href={group.children[0].href}
                className="text-sm font-medium text-[#404040] hover:text-[#2c2c2c] transition-colors"
              >
                {group.label}
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute top-full left-1/2 -translate-x-1/2 min-w-[140px] bg-white shadow-md rounded-b-lg py-2">
                {group.children.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-5 py-2 text-sm text-center text-[#404040] hover:bg-gray-50 hover:text-[#2c2c2c] whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-white border-t max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="py-2 border-b border-gray-100 last:border-b-0">
              <p className="px-6 py-2 text-xs font-medium text-[#999]">
                {group.label}
              </p>
              {group.children.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-2.5 text-sm text-[#404040] hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
