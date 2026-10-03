// 휴대폰 사진을 브라우저에서 JPEG로 줄인다 (본사진 긴 변 2000px, 미리보기 600px). 회전 정보도 반영한다.

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

// createImageBitmap이 못 여는 형식(데스크톱 크롬의 HEIC 등)은 <img>로 한 번 더 시도한다.
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function draw(
  source: ImageBitmap | HTMLImageElement,
  maxSide: number,
  quality: number,
): Promise<ResizedImage> {
  const srcW = "naturalWidth" in source ? source.naturalWidth : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
  ctx.fillStyle = "#fff"; // 투명 PNG가 검게 나오지 않도록
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve({ blob, width, height }) : reject(new Error("이미지를 처리할 수 없습니다.")),
      "image/jpeg",
      quality,
    ),
  );
}

export async function resizeForUpload(
  file: File,
  { maxSide = 2000, quality = 0.85 }: { maxSide?: number; quality?: number } = {},
): Promise<{ full: ResizedImage; thumb: ResizedImage }> {
  const source = await decode(file);
  try {
    const full = await draw(source, maxSide, quality);
    const thumb = await draw(source, 600, 0.8);
    return { full, thumb };
  } finally {
    if ("close" in source) source.close();
  }
}
