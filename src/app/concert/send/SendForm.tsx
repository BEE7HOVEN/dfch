"use client";

import { useState } from "react";
import { INVITE_NAME_MAX } from "@/lib/inviteName";

// 교인이 자기 이름을 넣어 초청장 링크를 만들고 카카오톡 등으로 보낸다. 이름은 링크에만 담기고 서버에는 저장하지 않는다.
export default function SendForm() {
  const [name, setName] = useState("");
  const [to, setTo] = useState("");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  // 화면에서 "님"을 붙이므로 직접 쓴 끝의 "님"은 뺀다 (서버도 같은 규칙으로 다듬는다).
  const clean = (v: string) => v.trim().replace(/(.)님$/, "$1").trim();
  const sender = clean(name);
  const receiver = clean(to);

  const q = new URLSearchParams();
  if (sender) q.set("from", sender);
  if (receiver) q.set("to", receiver);
  const invitePath = q.toString() ? `/concert/invite?${q}` : "/concert/invite";

  function makeLink(): string {
    return `${window.location.origin}${invitePath}`;
  }

  // 받는 분 화면에 보일 문구 미리보기
  const preview =
    sender && receiver
      ? `${sender}님이 ${receiver}님을 초대합니다`
      : sender
        ? `${sender}님이 초대합니다`
        : receiver
          ? `${receiver}님을 초대합니다`
          : "초대합니다";

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
    const who = sender && receiver ? `${sender}님이 ${receiver}님을 ` : sender ? `${sender}님이 ` : receiver ? `${receiver}님을 ` : "";
    const data = {
      title: "3인 초청음악회에 초대합니다",
      text: `${who}12월 5일(토) 오후 4시 군포 드림숲교회 3인 초청음악회에 초대합니다. 전석 무료입니다.`,
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
    <section className="rounded-2xl bg-white p-6">
      <h1 className="text-[22px] font-bold text-ink">초대장 보내기</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-sub">
        받는 분 화면에 <b className="text-forest">&ldquo;{preview}&rdquo;</b>로 보입니다. 이름 뒤에 &ldquo;님&rdquo;은 붙이지 않아도 됩니다.
      </p>
      <label className="mt-4 block text-[14px] text-sub" htmlFor="invite-from">
        보내는 사람 (본인 이름, 선택)
      </label>
      <input
        id="invite-from"
        value={name}
        maxLength={INVITE_NAME_MAX}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 김집사"
        className="mt-1.5 h-12 w-full rounded-xl border border-line px-4 text-[16px] text-ink outline-none focus:border-forest"
      />
      <label className="mt-4 block text-[14px] text-sub" htmlFor="invite-to">
        받는 사람 (초대할 분 이름, 선택)
      </label>
      <input
        id="invite-to"
        value={to}
        maxLength={INVITE_NAME_MAX}
        onChange={(e) => setTo(e.target.value)}
        placeholder="예: 박영희"
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
      <a
        href={invitePath}
        target="_blank"
        rel="noopener"
        className="mt-4 block text-center text-[14px] font-semibold text-forest underline underline-offset-4"
      >
        받는 분 화면 미리 보기
      </a>
      {failed && <p className="mt-3 text-[13px] text-mute">링크 복사가 막혀 있어 창으로 보여 드렸습니다.</p>}
    </section>
  );
}
