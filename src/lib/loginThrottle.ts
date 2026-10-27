// 관리자 로그인 시도 제한: 접속 주소(IP)별로 틀린 횟수를 세고, 5번마다 잠금 시간을 늘린다.
// 5번 → 1분, 10번 → 5분, 15번 → 15분, 20번 이상(5번 단위) → 1시간. 로그인에 성공하면 처음부터 다시 센다.
// Vercel은 요청마다 서버가 따로 뜨므로 횟수는 DB에 둔다.
import { headers } from "next/headers";
import { getSql } from "@/lib/db";

const LOCK_EVERY = 5; // 이만큼 틀릴 때마다 잠근다
const FORGET_AFTER = "24 hours"; // 이 시간 동안 시도가 없으면 횟수를 잊는다

let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  tableReady ??= (async () => {
    await getSql()`CREATE TABLE IF NOT EXISTS login_attempts (
      ip text PRIMARY KEY,
      failures int NOT NULL DEFAULT 0,
      locked_until timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
  })().catch((e) => {
    tableReady = null;
    throw e;
  });
  return tableReady;
}

// Vercel이 붙여 주는 접속 주소. 없으면(로컬 등) 한 묶음으로 센다.
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
}

// 지금 잠겨 있으면 남은 초, 아니면 0
export async function lockedSeconds(ip: string): Promise<number> {
  await ensureTable();
  const rows = await getSql()`
    SELECT GREATEST(0, CEIL(EXTRACT(EPOCH FROM (locked_until - now()))))::int AS s
    FROM login_attempts WHERE ip = ${ip} AND locked_until IS NOT NULL
  `;
  return rows.length ? Number(rows[0].s) : 0;
}

// 틀린 비밀번호를 기록한다. 이번에 잠기면 잠금 초와 지금까지 틀린 횟수를 돌려준다.
export async function recordFailure(ip: string): Promise<{ failures: number; lockSeconds: number }> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    WITH cur AS (
      SELECT CASE WHEN updated_at < now() - ${FORGET_AFTER}::interval THEN 0 ELSE failures END AS f
      FROM login_attempts WHERE ip = ${ip}
    ), nf AS (SELECT COALESCE((SELECT f FROM cur), 0) + 1 AS n)
    INSERT INTO login_attempts (ip, failures, locked_until, updated_at)
    SELECT ${ip}, n,
      CASE WHEN n % ${LOCK_EVERY} = 0 THEN now() + (
        CASE n WHEN 5 THEN interval '1 minute' WHEN 10 THEN interval '5 minutes'
               WHEN 15 THEN interval '15 minutes' ELSE interval '1 hour' END) END,
      now()
    FROM nf
    ON CONFLICT (ip) DO UPDATE
      SET failures = EXCLUDED.failures, locked_until = EXCLUDED.locked_until, updated_at = now()
    RETURNING failures,
      GREATEST(0, CEIL(EXTRACT(EPOCH FROM (locked_until - now()))))::int AS lock_seconds
  `;
  // 오래된 기록 정리 (실패할 때만, 가볍게)
  await sql`DELETE FROM login_attempts WHERE updated_at < now() - interval '7 days'`;
  return { failures: Number(rows[0].failures), lockSeconds: Number(rows[0].lock_seconds ?? 0) };
}

export async function clearFailures(ip: string): Promise<void> {
  await ensureTable();
  await getSql()`DELETE FROM login_attempts WHERE ip = ${ip}`;
}

export function untilLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}`;
  return s ? `${m}분 ${s}초` : `${m}분`;
}

export const ATTEMPTS_PER_ROUND = LOCK_EVERY;
