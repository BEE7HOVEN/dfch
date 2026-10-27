// 관리자: 음악회 예매자 목록, 취소, 예매 열기·닫기, CSV 내려받기, 공연 뒤 정보 삭제.
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { DESTROY_BY_LABEL, formatNumber, formatPhone, getSeatStatus, listReservations, ONLINE_LIMIT } from "@/lib/concert";
import { cancelReservationAction, destroyAllAction, setOpenAction } from "./actions";

export const dynamic = "force-dynamic";

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AdminConcertPage() {
  await requireAuth();
  const [status, rows] = await Promise.all([getSeatStatus(), listReservations()]);
  const activeCount = rows.filter((r) => r.status === "active").length;

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <PageHeader path="/admin" title="음악회 예매 관리" />
        <section className="shell pb-20 md:pb-28">
          <Link href="/admin" className="text-sm text-sub hover:text-forest">← 글 관리로</Link>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-mist p-5">
              <p className="text-sm text-sub">남은 좌석</p>
              <p className="mt-1 text-[28px] font-bold text-forest">{status.remaining}<span className="text-base font-medium text-sub"> / 전체 200석</span></p>
              <p className="mt-1 text-xs text-mute">온라인 {ONLINE_LIMIT}석 중 {status.booked}명 예매 · 현장 50석 제외</p>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <p className="text-sm text-sub">예매 상태</p>
              <p className="mt-1 text-[20px] font-bold text-ink">{status.closed ? "닫힘" : "열림"}</p>
              <p className="mt-1 text-xs text-mute">12월 5일 정오에 자동으로 닫힙니다.</p>
              <form action={setOpenAction} className="mt-3">
                <input type="hidden" name="open" value={status.open ? "0" : "1"} />
                <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-sub hover:border-forest hover:text-forest">
                  {status.open ? "예매 닫기" : "예매 열기"}
                </button>
              </form>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <p className="text-sm text-sub">예매 건수</p>
              <p className="mt-1 text-[20px] font-bold text-ink">{activeCount}건</p>
              <a href="/admin/concert/export" className="mt-3 inline-block rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-deep">
                엑셀(CSV) 내려받기
              </a>
            </div>
          </div>

          {rows.length === 0 ? (
            <p className="mt-8 py-20 text-center text-mute border-t-2 border-ink">아직 예매가 없습니다.</p>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] border-t-2 border-ink text-[15px]">
                <thead>
                  <tr className="border-b border-line text-left text-sm text-mute">
                    <th className="py-3 pl-2 font-medium">번호</th>
                    <th className="font-medium">이름</th>
                    <th className="font-medium">연락처</th>
                    <th className="font-medium">인원</th>
                    <th className="font-medium">예매 시각</th>
                    <th className="pr-2 text-right font-medium">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={`border-b border-line ${r.status === "cancelled" ? "text-mute line-through" : "text-ink"}`}>
                      <td className="py-3 pl-2 tabular-nums">{formatNumber(r.number)}</td>
                      <td>{r.name}</td>
                      <td className="tabular-nums">{formatPhone(r.phone)}</td>
                      <td>{r.party_size}명</td>
                      <td className="tabular-nums">{formatTime(r.created_at)}</td>
                      <td className="pr-2 text-right no-underline">
                        {r.status === "active" ? (
                          <form action={cancelReservationAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button type="submit" className="text-sm text-red-600 hover:text-red-700">취소</button>
                          </form>
                        ) : (
                          <span className="text-xs">취소됨</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-red-200 bg-red-50/40 p-5">
            <p className="text-[15px] font-semibold text-ink">공연 뒤 개인정보 파기</p>
            <p className="mt-1 text-sm text-sub">
              예매자 정보는 {DESTROY_BY_LABEL}까지 모두 지워야 합니다. 지우면 되돌릴 수 없으니 먼저 CSV를 내려받아 입장 확인에 쓰고, 공연이 끝난 뒤 실행하세요.
            </p>
            <form action={destroyAllAction} className="mt-3 flex flex-wrap items-center gap-2">
              <input name="confirm" placeholder="삭제 라고 입력" className="rounded-lg border border-line px-3 py-2 text-sm" />
              <button type="submit" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                예매자 정보 모두 삭제
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
