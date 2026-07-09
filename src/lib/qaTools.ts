// QA 도구 사용 가능 여부를 한 곳에서 판단하기 위해 사용합니다.
export function isQaToolsEnabled() {
  return (
    !import.meta.env.PROD || import.meta.env.VITE_ENABLE_QA_TOOLS === "true"
  );
}
