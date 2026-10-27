"use server";

import { revalidatePath } from "next/cache";
import { MAX_PARTY, reserve } from "@/lib/concert";

export interface ReserveState {
  error?: string;
  done?: { number: number; name: string; party: number };
}

export async function reserveAction(_prev: ReserveState, formData: FormData): Promise<ReserveState> {
  // 사람이 보지 못하는 칸이 채워져 있으면 자동 입력 프로그램으로 보고 거절한다.
  if (String(formData.get("website") ?? "") !== "") return { error: "예매를 처리하지 못했습니다. 다시 시도해 주세요." };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const party = Number(formData.get("party"));

  if (name.length < 2 || name.length > 20) return { error: "예매자 이름을 2~20자로 입력해 주세요." };
  if (!/^01[016789]\d{7,8}$/.test(phone)) return { error: "연락처를 010-1234-5678 형식으로 입력해 주세요." };
  if (!Number.isInteger(party) || party < 1 || party > MAX_PARTY) return { error: `예매 인원은 1~${MAX_PARTY}명입니다.` };
  if (formData.get("consent") !== "on") return { error: "개인정보 수집·이용에 동의해 주세요." };

  const result = await reserve({ name, phone, party });
  revalidatePath("/concert");
  if (result.ok) return { done: { number: result.number, name, party } };
  if (result.reason === "duplicate") return { error: "이미 이 연락처로 예매하셨습니다. 변경이 필요하면 교회(031-421-6191)로 연락해 주세요." };
  if (result.reason === "closed") return { error: "예매가 마감되었습니다." };
  return { error: `남은 좌석이 ${result.remaining}석뿐입니다. 인원을 줄여 주세요.` };
}
