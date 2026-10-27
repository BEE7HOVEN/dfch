-- 초청음악회 예매. 새 표 두 개만 만들고 기존 표는 건드리지 않는다.
CREATE TABLE IF NOT EXISTS concert_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number serial NOT NULL,                      -- 화면에 보이는 예매번호 (C-0001)
  name text NOT NULL,
  phone text NOT NULL,                         -- 숫자만 (01012345678)
  party_size int NOT NULL CHECK (party_size BETWEEN 1 AND 4),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  consented_at timestamptz NOT NULL,           -- 개인정보 동의 시각
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 같은 전화번호로는 유효한 예매를 하나만 (취소하면 다시 예매 가능)
CREATE UNIQUE INDEX IF NOT EXISTS concert_reservations_active_phone
  ON concert_reservations (phone) WHERE status = 'active';

-- 관리자 열기·닫기 스위치 (한 줄만 둔다)
CREATE TABLE IF NOT EXISTS concert_config (
  id int PRIMARY KEY CHECK (id = 1),
  open boolean NOT NULL DEFAULT true
);
INSERT INTO concert_config (id, open) VALUES (1, true) ON CONFLICT DO NOTHING;
