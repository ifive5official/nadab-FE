import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";
import TailwindLegacyPlugin from "vite-plugin-tailwind-legacy";
import legacy from "@vitejs/plugin-legacy";
const socialEnvKeys = [
  "VITE_GOOGLE_CLIENT_ID_SERVER",
  "VITE_GOOGLE_CLIENT_ID_IOS",
  "VITE_GOOGLE_CLIENT_ID_ANDROID",
  "VITE_KAKAO_APP_KEY",
  "VITE_KAKAO_WEB_KEY",
] as const;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const productionEnv = loadEnv("production", process.cwd(), "");
  const modeEnv = loadEnv(mode, process.cwd(), "");
  const envWithFallback = { ...productionEnv, ...modeEnv };

  return {
    define: Object.fromEntries(
      socialEnvKeys.map((key) => [
        `import.meta.env.${key}`,
        JSON.stringify(envWithFallback[key]),
      ]),
    ),
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
      TailwindLegacyPlugin({
        tailwindConfig: "tailwind.config.legacy.js",
        assetsDir: "dist/assets",
        publicPath: "assets/",
        injectInHTML: false,
      }),
      legacy({
        targets: ["chrome >= 80"], // api 30 이상 대응
        modernPolyfills: true,
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        "/api": {
          target: "https://nadab-dev.n-e.kr",
          changeOrigin: true,
        },
      },
    },
  };
});
