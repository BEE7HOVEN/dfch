// 초청음악회 예매: 좌석 수 계산과 예매·취소. 좌석 지정은 없고 예매 인원 합으로 센다.
import { getSql } from "@/lib/db";
import { CLOSES_AT, ONLINE_LIMIT } from "@/lib/concertConfig";

export * from "@/lib/concertConfig";

// 동시에 여러 명이 눌러도 한 번에 한 건씩 확인하도록 거는 잠금 번호
const LOCK_KEY = 20261205;

// 표가 없으면 만든다 (db/migrations/004_concert.sql과 같은 내용, 이미 있으면 아무 일도 하지 않는다).
// 운영 DB에 따로 SQL을 돌리지 않아도 배포만으로 준비되게 하려는 장치로, 서버가 처음 쓸 때 한 번만 확인한다.
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const sql = getSql();
    await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(${LOCK_KEY + 1})`,
      sql`CREATE TABLE IF NOT EXISTS concert_reservations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        number serial NOT NULL,
        name text NOT NULL,
        phone text NOT NULL,
        party_size int NOT NULL CHECK (party_size BETWEEN 1 AND 4),
        status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
        consented_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`,
      sql`CREATE UNIQUE INDEX IF NOT EXISTS concert_reservations_active_phone
        ON concert_reservations (phone) WHERE status = 'active'`,
      sql`CREATE TABLE IF NOT EXISTS concert_config (
        id int PRIMARY KEY CHECK (id = 1),
        open boolean NOT NULL DEFAULT true
      )`,
      sql`INSERT INTO concert_config (id, open) VALUES (1, true) ON CONFLICT DO NOTHING`,
    ]);
  })().catch((e) => {
    schemaReady = null; // 실패하면 다음 요청에서 다시 시도
    throw e;
  });
  return schemaReady;
}

export interface Reservation {
  id: string;
  number: number;
  name: string;
  phone: string;
  party_size: number;
  status: "active" | "cancelled";
  created_at: string;
}

export interface SeatStatus {
  booked: number; // 온라인으로 예매된 인원
  remaining: number; // 남은 좌석
  open: boolean; // 관리자 스위치
  closed: boolean; // 스위치가 꺼졌거나 마감 시각이 지남
}

export async function getSeatStatus(): Promise<SeatStatus> {
  await ensureSchema();
  const sql = getSql();
  const [seats, config] = await Promise.all([
    sql`SELECT COALESCE(SUM(party_size), 0)::int AS booked FROM concert_reservations WHERE status = 'active'`,
    sql`SELECT open FROM concert_config WHERE id = 1`,
  ]);
  const booked = Number(seats[0].booked);
  const open = config[0]?.open !== false;
  return {
    booked,
    remaining: Math.max(0, ONLINE_LIMIT - booked),
    open,
    closed: !open || Date.now() >= CLOSES_AT.getTime(),
  };
}

export type ReserveResult =
  | { ok: true; number: number }
  | { ok: false; reason: "closed" | "duplicate" | "full"; remaining?: number };

export async function reserve(input: { name: string; phone: string; party: number }): Promise<ReserveResult> {
  const sql = getSql();
  if ((await getSeatStatus()).closed) return { ok: false, reason: "closed" };

  // 잠금을 잡은 같은 트랜잭션 안에서 남은 좌석을 다시 세고 넣는다. 자리가 모자라면 0행이 들어간다.
  const [, inserted] = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(${LOCK_KEY})`,
    sql`
      INSERT INTO concert_reservations (name, phone, party_size, consented_at)
      SELECT ${input.name}, ${input.phone}, ${input.party}::int, now()
      WHERE (SELECT COALESCE(SUM(party_size), 0) FROM concert_reservations WHERE status = 'active') + ${input.party}::int <= ${ONLINE_LIMIT}
        AND COALESCE((SELECT open FROM concert_config WHERE id = 1), true)
      ON CONFLICT DO NOTHING
      RETURNING number
    `,
  ]);
  if (inserted.length > 0) return { ok: true, number: Number(inserted[0].number) };

  // 들어가지 않은 이유를 가린다: 같은 전화번호 → 마감 → 좌석 부족
  const dup = await sql`SELECT 1 FROM concert_reservations WHERE phone = ${input.phone} AND status = 'active' LIMIT 1`;
  if (dup.length > 0) return { ok: false, reason: "duplicate" };
  const status = await getSeatStatus();
  if (status.closed) return { ok: false, reason: "closed" };
  return { ok: false, reason: "full", remaining: status.remaining };
}

// --- 관리자 ---

export async function listReservations(): Promise<Reservation[]> {
  await ensureSchema();
  const rows = await getSql()`
    SELECT id, number, name, phone, party_size, status, created_at::text AS created_at
    FROM concert_reservations ORDER BY number
  `;
  return rows as Reservation[];
}

export async function cancelReservation(id: string): Promise<void> {
  await getSql()`UPDATE concert_reservations SET status = 'cancelled' WHERE id = ${id}::uuid`;
}

export async function setConcertOpen(open: boolean): Promise<void> {
  await getSql()`UPDATE concert_config SET open = ${open} WHERE id = 1`;
}

// 공연 뒤 개인정보 파기: 예매 기록을 모두 지운다.
export async function deleteAllReservations(): Promise<void> {
  await getSql()`DELETE FROM concert_reservations`;
}
