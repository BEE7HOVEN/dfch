// 교회소식 > 공지사항 글 본문
import BoardDetail from "@/components/BoardDetail";
import { boards } from "@/lib/boards";
import { postMetadata } from "@/lib/postMetadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return postMetadata(boards.notice, id);
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  return <BoardDetail board={boards.notice} id={id} />;
}
