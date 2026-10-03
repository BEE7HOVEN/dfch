// 검색에 올리지 않을 페이지(주보)의 robots 설정: 페이지·사진을 색인하지 않고 링크(원본 PDF)도 따라가지 않게 한다.
import type { Metadata } from "next";

export const NO_SEARCH: Metadata["robots"] = {
  index: false,
  follow: false,
  noimageindex: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};
