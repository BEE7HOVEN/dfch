// 교회소식 > 공지사항 목록
import BoardList from "@/components/BoardList";
import { boards } from "@/lib/boards";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata("/news/notice", "드림숲교회 소식과 안내입니다.");

export const dynamic = "force-dynamic";

export default function NoticePage() {
  return <BoardList board={boards.notice} />;
}
