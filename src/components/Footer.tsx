import Link from "next/link";
import Image from "next/image";
import { navGroups } from "@/lib/nav";

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

          <nav className="grid grid-cols-3 gap-6 md:gap-12">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <p className="text-sm text-white mb-1">{group.label}</p>
                {group.children.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
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
