// 생명의 말씀 > 매일의 묵상 글 본문
import BoardDetail from "@/components/BoardDetail";
import { boards } from "@/lib/boards";

export const dynamic = "force-dynamic";

export default async function MeditationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BoardDetail board={boards.meditation} id={id} />;
}
