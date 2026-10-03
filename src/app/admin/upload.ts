// 서명된 R2 주소로 파일을 직접 올리는 공용 함수 (녹음·사진·PDF 업로드가 함께 쓴다)

// fetch는 업로드 진행률을 알 수 없어 XMLHttpRequest를 쓴다.
export function putWithProgress(
  url: string,
  body: Blob,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`업로드 실패: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("업로드 중 네트워크 오류"));
    xhr.send(body);
  });
}

export function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
