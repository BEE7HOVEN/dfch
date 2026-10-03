import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";

export const dynamic = "force-dynamic";

export default function LettersPage() {
  return <BoardList board={boards.letter} />;
}
