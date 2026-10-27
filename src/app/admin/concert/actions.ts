"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { cancelReservation, deleteAllReservations, setConcertOpen } from "@/lib/concert";

function refresh() {
  revalidatePath("/admin/concert");
  revalidatePath("/concert");
}

export async function cancelReservationAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (/^[0-9a-f-]{36}$/i.test(id)) await cancelReservation(id);
  refresh();
}

export async function setOpenAction(formData: FormData): Promise<void> {
  await requireAuth();
  await setConcertOpen(formData.get("open") === "1");
  refresh();
}

// 공연 뒤 개인정보 파기: 확인 문구를 입력해야만 지운다.
export async function destroyAllAction(formData: FormData): Promise<void> {
  await requireAuth();
  if (String(formData.get("confirm") ?? "").trim() !== "삭제") return;
  await deleteAllReservations();
  refresh();
}
