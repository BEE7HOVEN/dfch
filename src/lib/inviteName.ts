// 초청장 링크의 ?from=이름 값을 화면에 쓰기 전에 다듬는다. 누구든 주소를 고칠 수 있으므로 길이와 글자를 제한한다.
export const INVITE_NAME_MAX = 20;

export function cleanInviteName(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "";
  const name = Array.from(
    value
      .replace(/[\u0000-\u001f\u007f<>]/g, "") // 제어 문자와 꺾쇠 제거
      .replace(/\s+/g, " ")
      .trim(),
  )
    .slice(0, INVITE_NAME_MAX)
    .join("");
  // 화면에서 "님"을 붙이므로 직접 쓴 "님"은 뺀다 (예: "김집사님" → "김집사"). 이름이 "님" 한 글자뿐이면 그대로 둔다.
  return name.length > 1 && name.endsWith("님") ? name.slice(0, -1).trim() : name;
}
