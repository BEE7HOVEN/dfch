// 주보 1쪽의 헌금자 명단 등 가릴 곳을 하얗게 지우고, 가린 쪽 사진으로 PDF를 다시 만든다 (원본 PDF 대신 올림).
// 주보 양식이 매주 같아 기본 위치를 두고, 관리자가 옮긴 위치는 이 브라우저에 기억한다.

// 쪽 크기에 대한 비율 (x0, y0, x1, y1). 2026-07-12 주보의 "지난주 헌금 영수기" 상자 자리.
export type Box = [number, number, number, number];
export const DEFAULT_BOX: Box = [0.3775, 0.7236, 0.6875, 0.9346];
const STORAGE_KEY = "dfch.bulletinRedactBox";

export function loadBox(): Box {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(raw) && raw.length === 4 && raw.every((n) => typeof n === "number" && n >= 0 && n <= 1)) {
      return raw as Box;
    }
  } catch {
    // 저장소를 못 쓰는 브라우저면 기본 위치를 쓴다.
  }
  return DEFAULT_BOX;
}

export function saveBox(box: Box) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(box));
  } catch {
    // 기억 못 해도 이번 업로드에는 지장 없다.
  }
}

async function toCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 처리할 수 없습니다."))), type, quality),
  );
}

// 쪽 사진의 box 영역을 흰색으로 칠한다 (무손실 PNG로 돌려줘 올릴 때 한 번만 압축되게).
export async function redactPage(page: File, box: Box): Promise<File> {
  const canvas = await toCanvas(page);
  const ctx = canvas.getContext("2d")!;
  const [x0, y0, x1, y1] = box;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x0 * canvas.width, y0 * canvas.height, (x1 - x0) * canvas.width, (y1 - y0) * canvas.height);
  return new File([await toBlob(canvas, "image/png")], page.name, { type: "image/png" });
}

// 쪽 사진들로 PDF를 만든다. 쪽 크기는 A4(가로/세로는 사진 방향을 따름).
export async function pagesToPdf(pages: File[], name: string): Promise<File> {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const page of pages) {
    const canvas = await toCanvas(page);
    const jpg = await pdf.embedJpg(await (await toBlob(canvas, "image/jpeg", 0.85)).arrayBuffer());
    const landscape = canvas.width > canvas.height;
    const [w, h] = landscape ? [841.89, 595.28] : [595.28, 841.89];
    pdf.addPage([w, h]).drawImage(jpg, { x: 0, y: 0, width: w, height: h });
  }
  const bytes = await pdf.save();
  return new File([bytes as BlobPart], name, { type: "application/pdf" });
}
