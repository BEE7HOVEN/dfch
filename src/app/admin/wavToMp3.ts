// 브라우저에서 WAV 녹음을 조금씩 읽어 모노 64kbps MP3로 바꾸는 변환기 (휴대폰 메모리를 아끼려고 통째로 풀지 않는다)

interface WavInfo {
  format: "int" | "float";
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  blockAlign: number;
  dataOffset: number;
  dataSize: number;
}

export function isWav(file: File): boolean {
  return /\.(wav|wave)$/i.test(file.name);
}

async function readBytes(file: File, start: number, length: number) {
  return new DataView(await file.slice(start, start + length).arrayBuffer());
}

function fourCC(view: DataView, offset: number) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

// RIFF 청크를 따라가며 fmt·data 위치만 찾는다. 지원하지 않는 형식이면 null.
async function parseWav(file: File): Promise<WavInfo | null> {
  const head = await readBytes(file, 0, 12);
  if (head.byteLength < 12 || fourCC(head, 0) !== "RIFF" || fourCC(head, 8) !== "WAVE") {
    return null;
  }

  let offset = 12;
  let fmt: Omit<WavInfo, "dataOffset" | "dataSize"> | null = null;
  while (offset + 8 <= file.size) {
    const chunk = await readBytes(file, offset, 8);
    const id = fourCC(chunk, 0);
    const size = chunk.getUint32(4, true);
    const body = offset + 8;

    if (id === "fmt ") {
      const f = await readBytes(file, body, Math.min(size, 40));
      let tag = f.getUint16(0, true);
      if (tag === 0xfffe && size >= 26) tag = f.getUint16(24, true); // WAVE_FORMAT_EXTENSIBLE
      const bitsPerSample = f.getUint16(14, true);
      const format =
        tag === 1 && [16, 24, 32].includes(bitsPerSample)
          ? "int"
          : tag === 3 && bitsPerSample === 32
            ? "float"
            : null;
      if (!format) return null;
      fmt = {
        format,
        channels: f.getUint16(2, true),
        sampleRate: f.getUint32(4, true),
        bitsPerSample,
        blockAlign: f.getUint16(12, true),
      };
    } else if (id === "data") {
      if (!fmt) return null;
      // 녹음 도중 끊긴 파일은 data 크기가 실제보다 클 수 있어 파일 끝에서 자른다.
      return { ...fmt, dataOffset: body, dataSize: Math.min(size, file.size - body) };
    }
    offset = body + size + (size % 2); // 청크는 2바이트 단위로 맞춰져 있다.
  }
  return null;
}

// 여러 채널을 평균 내 모노 Float32(-1~1)로 만든다.
function toMono(view: DataView, info: WavInfo, frames: number): Float32Array {
  const out = new Float32Array(frames);
  const bytes = info.bitsPerSample / 8;
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < info.channels; c++) {
      const p = i * info.blockAlign + c * bytes;
      if (info.format === "float") sum += view.getFloat32(p, true);
      else if (bytes === 2) sum += view.getInt16(p, true) / 32768;
      else if (bytes === 3) {
        const v = view.getUint8(p) | (view.getUint8(p + 1) << 8) | (view.getInt8(p + 2) << 16);
        sum += v / 8388608;
      } else sum += view.getInt32(p, true) / 2147483648;
    }
    out[i] = Math.max(-1, Math.min(1, sum / info.channels));
  }
  return out;
}

// 변환할 수 없는 WAV면 null을 돌려준다(호출하는 쪽에서 원본을 그대로 올린다).
export async function wavToMp3(
  file: File,
  onProgress: (percent: number) => void,
): Promise<File | null> {
  const info = await parseWav(file);
  if (!info || info.channels < 1 || info.blockAlign < 1) return null;

  const { createMp3Encoder } = await import("wasm-media-encoders");
  const encoder = await createMp3Encoder();
  encoder.configure({ sampleRate: info.sampleRate, channels: 1, bitrate: 64 });

  const parts: Uint8Array[] = [];
  const framesPerChunk = info.sampleRate; // 약 1초씩
  const totalFrames = Math.floor(info.dataSize / info.blockAlign);
  for (let done = 0; done < totalFrames; done += framesPerChunk) {
    const frames = Math.min(framesPerChunk, totalFrames - done);
    const view = await readBytes(
      file,
      info.dataOffset + done * info.blockAlign,
      frames * info.blockAlign,
    );
    // 인코더가 돌려준 배열은 다음 호출 때 덮어쓰이므로 복사해 둔다.
    parts.push(encoder.encode([toMono(view, info, frames)]).slice());
    onProgress(Math.round(((done + frames) / totalFrames) * 100));
  }
  parts.push(encoder.finalize().slice());

  const name = file.name.replace(/\.(wav|wave)$/i, ".mp3");
  return new File(parts as BlobPart[], name, { type: "audio/mpeg" });
}
