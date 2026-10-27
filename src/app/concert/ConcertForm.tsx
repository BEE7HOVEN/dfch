"use client";

import { useActionState, useState } from "react";
import { reserveAction, type ReserveState } from "./actions";
import { DESTROY_BY_LABEL, MAX_PARTY, formatNumber } from "@/lib/concertConfig";

const initialState: ReserveState = {};

// 숫자만 남기고 010-1234-5678 모양으로 보여 준다.
function formatInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
}

export default function ConcertForm({ remaining }: { remaining: number }) {
  const [state, action, pending] = useActionState(reserveAction, initialState);
  const [phone, setPhone] = useState("");
  const [party, setParty] = useState(1);

  if (state.done) {
    return (
      <div className="rounded-2xl border border-line bg-mist p-7 md:p-9 text-center">
        <p className="text-[13px] font-semibold tracking-widest text-forest">RESERVED</p>
        <h2 className="mt-2 text-[24px] font-bold text-ink">예매가 완료되었습니다</h2>
        <p className="mt-6 text-[15px] text-sub">예매번호</p>
        <p className="text-[34px] font-bold tracking-wide text-forest">{formatNumber(state.done.number)}</p>
        <p className="mt-4 text-[15px] text-ink">
          {state.done.name}님 · {state.done.party}명
        </p>
        <p className="mt-6 text-[14px] leading-relaxed text-sub">
          문자는 발송되지 않습니다. 이 화면을 <b className="text-ink">캡처해 두세요.</b>
          <br />
          입장하실 때 성함으로 확인해 드립니다.
          <br />
          변경·취소는 교회(031-421-6191)로 연락해 주세요.
        </p>
      </div>
    );
  }

  const maxParty = Math.min(MAX_PARTY, remaining);

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-line bg-white p-6 md:p-8">
      {/* 사람 눈에는 보이지 않는 칸 (자동 입력 프로그램 거르기) */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div>
        <label htmlFor="name" className="block text-sm text-sub mb-2">예매자 이름</label>
        <input
          id="name"
          name="name"
          required
          maxLength={20}
          autoComplete="name"
          className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm text-sub mb-2">연락처</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          required
          placeholder="010-1234-5678"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatInput(e.target.value))}
          className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
      </div>

      <div>
        <span className="block text-sm text-sub mb-2">예매 인원 (최대 {MAX_PARTY}명)</span>
        <input type="hidden" name="party" value={party} />
        <div className="inline-flex items-center rounded-lg border border-line">
          <button
            type="button"
            aria-label="인원 줄이기"
            onClick={() => setParty((p) => Math.max(1, p - 1))}
            disabled={party <= 1}
            className="h-12 w-12 text-xl text-forest disabled:text-mute"
          >
            −
          </button>
          <span className="w-14 text-center text-[17px] font-semibold text-ink" aria-live="polite">{party}명</span>
          <button
            type="button"
            aria-label="인원 늘리기"
            onClick={() => setParty((p) => Math.min(maxParty, p + 1))}
            disabled={party >= maxParty}
            className="h-12 w-12 text-xl text-forest disabled:text-mute"
          >
            +
          </button>
        </div>
        {remaining < MAX_PARTY && (
          <p className="mt-2 text-[13px] text-mute">남은 좌석이 {remaining}석이라 최대 {remaining}명까지 가능합니다.</p>
        )}
      </div>

      <div className="rounded-xl bg-paper p-4">
        <label className="flex items-start gap-3 text-[15px] text-ink">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#355a44]" />
          <span>
            <b>[필수]</b> 개인정보 수집·이용에 동의합니다. 만 14세 이상입니다.
          </span>
        </label>
        <details className="mt-3 text-[13px] leading-relaxed text-sub">
          <summary className="cursor-pointer text-forest">내용 보기</summary>
          <dl className="mt-3 space-y-2">
            <div><dt className="inline font-semibold text-ink">수집 항목 </dt><dd className="inline">이름, 연락처</dd></div>
            <div><dt className="inline font-semibold text-ink">이용 목적 </dt><dd className="inline">공연 예매 확인, 입장 확인, 공연 변경·취소 시 연락</dd></div>
            <div><dt className="inline font-semibold text-ink">보유 기간 </dt><dd className="inline">공연 종료 후 7일까지({DESTROY_BY_LABEL}) 보관한 뒤 파기합니다. 파기는 전자 파일(데이터베이스 기록)을 삭제하는 방식입니다.</dd></div>
            <div><dt className="inline font-semibold text-ink">동의 거부 </dt><dd className="inline">동의하지 않을 수 있으며, 동의하지 않으면 온라인 예매를 할 수 없습니다(현장 접수는 가능합니다).</dd></div>
            <div><dt className="inline font-semibold text-ink">저장 위탁 </dt><dd className="inline">예매 정보는 홈페이지 운영 서버에 저장됩니다. 그 밖에 제3자에게 제공하지 않습니다.</dd></div>
            <div><dt className="inline font-semibold text-ink">문의·열람·삭제 요청 </dt><dd className="inline">드림숲교회 031-421-6191</dd></div>
          </dl>
        </details>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-forest text-white text-[16px] font-semibold rounded-lg hover:bg-forest-deep transition-colors disabled:opacity-50"
      >
        {pending ? "예매 중..." : "예매하기"}
      </button>
    </form>
  );
}
