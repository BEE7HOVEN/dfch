// 교회소식 > 주보 목록 (최신 날짜가 위)
import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";

export const dynamic = "force-dynamic";

export default function BulletinPage() {
  return <BoardList board={boards.bulletin} />;
}
