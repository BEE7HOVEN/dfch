"use client";
// 공유 버튼. 휴대폰에서는 기본 공유 창(카카오톡 등)을 열고, 지원하지 않는 PC 브라우저에서는 링크를 복사한다.

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // 사용자가 공유 창을 닫은 경우는 그냥 둔다.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("이 주소를 복사해 주세요.", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#2c2c2c] transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
        />
      </svg>
      {copied ? "링크를 복사했습니다" : "공유"}
    </button>
  );
}
