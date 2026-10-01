import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

// 테스트에서 라우트·CSS 생성 플러그인이 실행되지 않도록 별도 설정을 사용합니다.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  esbuild: { jsx: "automatic" },
});
