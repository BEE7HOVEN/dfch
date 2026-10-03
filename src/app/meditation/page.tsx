// 생명의 말씀 > 매일의 묵상 글 목록
import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";

export const dynamic = "force-dynamic";

export default function MeditationPage() {
  return <BoardList board={boards.meditation} />;
}
