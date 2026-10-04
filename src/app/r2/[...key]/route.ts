// 메인처럼 오래 캐시되는 화면에서 쓰는 R2 사진 고정 주소. 요청 때마다 새 서명 주소로 넘겨준다.
// 서명 주소를 HTML에 직접 넣으면 캐시된 화면이 6시간 넘게 쓰일 때 사진이 깨지기 때문이다.
// 갤러리 미리보기, 주보 사진(메인 금주의 주보는 원본을 크게 보여 줌), 메인 배너 사진만 허용해 다른 파일을 이 주소로 꺼낼 수 없게 한다.
import { createViewUrl } from "@/lib/r2";

const ALLOWED_KEY_RE =
  /^(gallery\/\d{4}-\d{2}-\d{2}-[0-9a-f-]{36}_t|(bulletin|banner)\/\d{4}-\d{2}-\d{2}-[0-9a-f-]{36}(_t)?)\.jpg$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const key = (await params).key.join("/");
  if (!ALLOWED_KEY_RE.test(key)) {
    return new Response("Not found", { status: 404 });
  }
  const url = await createViewUrl(key);
  // 서명 주소는 최소 3시간 유효하므로 넘겨주기 결과를 CDN에 1시간 캐시해 함수 실행을 줄인다.
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": "public, max-age=600, s-maxage=3600",
    },
  });
}
