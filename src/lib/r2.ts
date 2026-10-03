// Cloudflare R2(S3 호환 파일 저장소)의 업로드·재생용 서명 주소 발급과 파일 삭제. 서버에서만 사용.
import { AwsClient } from "aws4fetch";

function getR2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2 환경변수(R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)가 설정되지 않았습니다.",
    );
  }
  return {
    client: new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    }),
    baseUrl: `https://${accountId}.r2.cloudflarestorage.com/${bucket}`,
  };
}

// 서명을 쿼리스트링에 넣은 임시 주소. 브라우저가 이 주소로 바로 올리거나(PUT) 재생(GET)한다.
async function presign(method: "PUT" | "GET", key: string, expiresIn: number) {
  const { client, baseUrl } = getR2();
  const url = new URL(`${baseUrl}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await client.sign(url.toString(), {
    method,
    aws: { signQuery: true },
  });
  return signed.url;
}

export function createUploadUrl(key: string): Promise<string> {
  return presign("PUT", key, 60 * 10); // 10분
}

export function createDownloadUrl(key: string): Promise<string> {
  return presign("GET", key, 60 * 60 * 6); // 6시간
}

export async function deleteObject(key: string): Promise<void> {
  const { client, baseUrl } = getR2();
  const res = await client.fetch(`${baseUrl}/${key}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 파일 삭제 실패: ${res.status}`);
  }
}
