import BoardDetail from "@/components/BoardDetail";
import { boards } from "@/lib/boards";
import { postMetadata } from "@/lib/postMetadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return postMetadata(boards.letter, id);
}

export default async function LetterDetailPage({ params }: Props) {
  const { id } = await params;
  return <BoardDetail board={boards.letter} id={id} />;
}
