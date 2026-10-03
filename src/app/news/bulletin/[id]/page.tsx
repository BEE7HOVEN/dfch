// 교회소식 > 주보 본문 (사진은 바로 보이고 PDF는 보기 버튼)
import BoardDetail from "@/components/BoardDetail";
import { boards } from "@/lib/boards";
import { postMetadata } from "@/lib/postMetadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return postMetadata(boards.bulletin, id);
}

export default async function BulletinDetailPage({ params }: Props) {
  const { id } = await params;
  return <BoardDetail board={boards.bulletin} id={id} />;
}
