import Link from "next/link";
import Image from "next/image";

const navItems = [
  { label: "드림숲교회", href: "/" },
  { label: "섬기는 분들", href: "/pastor" },
  { label: "설교말씀", href: "/media" },
  { label: "목회편지", href: "/letters" },
  { label: "예배안내", href: "/service" },
];

export default function Footer() {
  return (
    <footer className="bg-[#2c2c2c] text-white/80">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Image
              src="/images/logo-light.png"
              alt="드림숲교회"
              width={120}
              height={43}
              className="brightness-0 invert"
            />
            <div className="mt-4 text-sm leading-relaxed">
              <p>경기도 군포시 삼성로 69번길 13</p>
              <p>Tel : 010-3360-6818</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/40">
          <p>&copy; 드림숲교회. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
