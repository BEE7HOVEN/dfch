// 교회소식 > 공지사항 목록
import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";

export const dynamic = "force-dynamic";

export default function NoticePage() {
  return <BoardList board={boards.notice} />;
}
