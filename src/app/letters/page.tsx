import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata("/letters", "담임목사가 성도에게 보내는 편지입니다.");

export const dynamic = "force-dynamic";

export default function LettersPage() {
  return <BoardList board={boards.letter} />;
}
