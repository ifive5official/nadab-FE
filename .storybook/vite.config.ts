import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// 라우트 생성·네이티브 설정·API 프록시 없이 화면 렌더링에 필요한 설정만 제공합니다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
  envPrefix: "STORYBOOK_",
});
