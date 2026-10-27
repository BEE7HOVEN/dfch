// 예매자 목록 CSV (엑셀에서 한글이 깨지지 않도록 BOM을 붙인다). 관리자만 받을 수 있다.
import { isAuthenticated } from "@/lib/auth";
import { formatNumber, formatPhone, listReservations } from "@/lib/concert";

export const dynamic = "force-dynamic";

// 엑셀이 수식으로 읽지 않도록 위험한 첫 글자를 막고, 쉼표·따옴표를 감싼다.
function cell(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// 예매 시각을 한국 시간 "2026-12-01 14:05"로
function seoulTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
  return parts;
}

export async function GET() {
  if (!(await isAuthenticated())) return new Response("로그인이 필요합니다.", { status: 401 });
  const rows = await listReservations();
  const lines = [["예매번호", "이름", "연락처", "인원", "상태", "예매 시각"].map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [formatNumber(r.number), r.name, formatPhone(r.phone), r.party_size, r.status === "active" ? "예매" : "취소", seoulTime(r.created_at)]
        .map(cell)
        .join(","),
    );
  }
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="concert-reservations.csv"',
      "Cache-Control": "no-store",
    },
  });
}
