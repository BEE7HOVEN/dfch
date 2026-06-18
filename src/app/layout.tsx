import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "드림숲교회",
  description: "말씀이 삶이 되고 나눔이 섬김이 되는 공동체 - 드림숲교회",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${quicksand.variable} h-full antialiased scroll-smooth`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-quicksand), 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
