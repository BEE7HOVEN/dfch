// 첨부 목록에 R2 보기 주소(본파일·미리보기)를 붙인다. 서버에서만 사용.
import type { Attachment } from "@/lib/posts";
import { createViewUrl } from "@/lib/r2";

export interface ViewableAttachment extends Attachment {
  fileUrl: string;
  thumbUrl: string | null;
}

export async function withViewUrls(
  attachments: Attachment[],
): Promise<ViewableAttachment[]> {
  return Promise.all(
    attachments.map(async (a) => ({
      ...a,
      fileUrl: await createViewUrl(a.file_key, {
        downloadName: a.kind === "pdf" ? (a.file_name ?? "주보.pdf") : undefined,
      }),
      thumbUrl: a.thumb_key ? await createViewUrl(a.thumb_key) : null,
    })),
  );
}
