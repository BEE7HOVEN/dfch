// 주보 PDF의 각 쪽을 브라우저에서 사진으로 바꾼다 (넘겨 보기·표지 미리보기용). pdf.js는 PDF를 고를 때만 불러온다.

// 주보는 가로 A4 한 장에 작은 글씨가 빽빽해, 일반 사진(2000px)보다 크게 둔다. 확대해도 글씨가 읽히는 선.
export const PDF_PAGE_LONG_SIDE = 2400;
export const PDF_PAGE_QUALITY = 0.8;

export async function pdfToPageImages(pdf: File): Promise<File[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

  const task = pdfjs.getDocument({ data: new Uint8Array(await pdf.arrayBuffer()) });
  const doc = await task.promise;
  const base = pdf.name.replace(/\.pdf$/i, "");
  const files: File[] = [];
  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const unit = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: PDF_PAGE_LONG_SIDE / Math.max(unit.width, unit.height) });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      // 인쇄용(print)으로 그려야 화면 갱신(requestAnimationFrame)을 기다리지 않아, 탭이 가려져 있어도 멈추지 않는다.
      await page.render({ canvas, viewport, background: "#ffffff", intent: "print" }).promise;
      // 여기서는 무손실(PNG)로 두고, 올릴 때 JPEG로 한 번만 압축해 화질이 두 번 깎이지 않게 한다.
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PDF 쪽을 사진으로 바꾸지 못했습니다.");
      files.push(new File([blob], `${base}-${n}쪽.png`, { type: "image/png" }));
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
  return files;
}
