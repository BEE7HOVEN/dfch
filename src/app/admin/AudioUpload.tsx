"use client";
// 묵상 녹음 파일을 고르는 즉시 R2로 직접 올리고, 올라간 파일 위치(audio_key)를 폼에 넘기는 입력칸

import { useState } from "react";
import { createAudioUploadAction } from "@/app/admin/actions";
import { isWav, wavToMp3 } from "./wavToMp3";

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// fetch는 업로드 진행률을 알 수 없어 XMLHttpRequest를 쓴다.
function putWithProgress(
  url: string,
  file: File,
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
    xhr.send(file);
  });
}

export default function AudioUpload({
  initialKey,
  onBusyChange,
}: {
  initialKey?: string | null;
  onBusyChange: (busy: boolean) => void;
}) {
  const [key, setKey] = useState(initialKey ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<"convert" | "upload">("upload");
  const [sizeNote, setSizeNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = input.files?.[0];
    if (!picked) return;

    setError(null);
    setSizeNote(null);
    setProgress(0);
    onBusyChange(true);
    try {
      // WAV는 용량이 커서 MP3로 바꿔 올린다. 바꿀 수 없는 WAV면 원본을 그대로 올린다.
      let file = picked;
      if (isWav(picked)) {
        setPhase("convert");
        const mp3 = await wavToMp3(picked, setProgress).catch((err) => {
          console.error(err);
          return null;
        });
        if (mp3) {
          file = mp3;
          setSizeNote(`WAV ${formatMB(picked.size)} → MP3 ${formatMB(mp3.size)}`);
        }
        setProgress(0);
      }
      setPhase("upload");
      const res = await createAudioUploadAction({
        fileName: file.name,
        size: file.size,
      });
      if (!res.ok) throw new Error(res.error);
      await putWithProgress(res.uploadUrl, file, res.contentType, setProgress);
      setKey(res.key);
      setFileName(picked.name);
    } catch (err) {
      setError(
        err instanceof Error && !err.message.startsWith("업로드")
          ? err.message
          : "업로드에 실패했습니다. 다시 시도해주세요.",
      );
      input.value = "";
    } finally {
      setProgress(null);
      onBusyChange(false);
    }
  }

  return (
    <div>
      <label htmlFor="audio" className="block text-sm text-[#404040] mb-2">
        녹음 파일
      </label>
      <input
        id="audio"
        type="file"
        accept="audio/*,.m4a,.mp3,.wav,.aac,.amr,.3gp"
        onChange={handleChange}
        disabled={progress !== null}
        className="block w-full text-sm text-[#404040] file:mr-4 file:px-4 file:py-2.5 file:rounded-lg file:border-0 file:bg-gray-100 file:text-[#404040] hover:file:bg-gray-200"
      />
      <input type="hidden" name="audio_key" value={key} />

      {progress !== null ? (
        <div className="mt-3">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#2c2c2c] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#666]">
            {phase === "convert" ? "MP3로 바꾸는 중..." : "올리는 중..."}{" "}
            {progress}%
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[#999]">
          {fileName
            ? `${fileName} 업로드 완료${sizeNote ? ` (${sizeNote})` : ""}`
            : key
              ? "등록된 녹음이 있습니다. 바꾸려면 새 파일을 골라주세요."
              : "휴대폰 녹음 파일(m4a, mp3 등)을 골라주세요. 고르면 바로 올라갑니다."}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
