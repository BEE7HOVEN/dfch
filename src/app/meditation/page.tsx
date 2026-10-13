// 생명의 말씀 > 매일의 묵상 글 목록
import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata("/meditation", "날마다 한 절씩 함께 읽고 묵상합니다.");

export const dynamic = "force-dynamic";

export default function MeditationPage() {
  return <BoardList board={boards.meditation} />;
}
