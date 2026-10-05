import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

// 앱 빌드와 분리된 설정으로 광고 화면 스토리만 로드합니다.
const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: { builder: { viteConfigPath: fileURLToPath(new URL("./vite.config.ts", import.meta.url)) } },
  },
  stories: ["../src/features/ad-rewards/**/*.stories.tsx"],
  staticDirs: ["../public"],
  core: { disableTelemetry: true },
};

export default config;
