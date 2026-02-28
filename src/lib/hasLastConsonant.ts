// 한글 받침 여부 판단
export function hasLastConsonant(text: string) {
  return (text.charCodeAt(text.length - 1) - "가".charCodeAt(0)) % 28 !== 0;
}
