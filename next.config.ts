import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 예전 주소(dfch.vercel.app)로 들어오면 같은 경로의 dfch.org로 넘겨 검색엔진이 한 사이트로 보게 한다.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "dfch.vercel.app" }],
        destination: "https://dfch.org/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i1.ytimg.com" },
      { protocol: "https", hostname: "i2.ytimg.com" },
      { protocol: "https", hostname: "i3.ytimg.com" },
    ],
  },
};

export default nextConfig;
