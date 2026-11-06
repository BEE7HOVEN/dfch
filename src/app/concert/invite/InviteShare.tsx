"use client";

import { useState } from "react";
import { INVITE_NAME_MAX } from "@/lib/inviteName";

// 교인이 자기 이름을 넣어 초청장 링크를 만들고 카카오톡 등으로 보낸다. 이름은 링크에만 담기고 서버에는 저장하지 않는다.
export default function InviteShare() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  function makeLink(): string {
    const base = `${window.location.origin}/concert/invite`;
    const n = name.trim();
    return n ? `${base}?from=${encodeURIComponent(n)}` : base;
  }

  async function copy() {
    const link = makeLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setFailed(true);
      window.prompt("링크를 길게 눌러 복사해 주세요", link);
    }
  }

  async function share() {
    const n = name.trim();
    const data = {
      title: "3인 초청음악회에 초대합니다",
      text: `${n ? `${n}님이 ` : ""}12월 5일(토) 오후 4시 군포 드림숲교회 3인 초청음악회에 초대합니다. 전석 무료입니다.`,
      url: makeLink(),
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
      } catch {
        // 공유 창을 닫은 경우: 아무것도 하지 않는다
      }
    } else {
      await copy();
    }
  }

  return (
    <section className="rounded-2xl border border-line p-6">
      <h2 className="text-[18px] font-bold text-ink">내 이름으로 초대장 보내기</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-sub">
        이름을 넣으면 받는 분 화면에 &ldquo;{name.trim() || "OOO"}님이 초대합니다&rdquo;로 보입니다. 본인 이름만 넣어 주세요.
      </p>
      <label className="mt-4 block text-[14px] text-sub" htmlFor="invite-from">
        보내는 사람 이름 (선택)
      </label>
      <input
        id="invite-from"
        value={name}
        maxLength={INVITE_NAME_MAX}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 김집사"
        className="mt-1.5 h-12 w-full rounded-xl border border-line px-4 text-[16px] text-ink outline-none focus:border-forest"
      />
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={share}
          className="h-12 w-full rounded-xl bg-forest text-[16px] font-semibold text-white active:bg-forest-deep"
        >
          카카오톡 등으로 보내기
        </button>
        <button
          type="button"
          onClick={copy}
          className="h-12 w-full rounded-xl border border-line text-[16px] font-semibold text-ink active:bg-paper"
        >
          {copied ? "복사했습니다" : "링크 복사"}
        </button>
      </div>
      {failed && <p className="mt-3 text-[13px] text-mute">링크 복사가 막혀 있어 창으로 보여 드렸습니다.</p>}
    </section>
  );
}
