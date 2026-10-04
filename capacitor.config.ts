import * as dotenv from "dotenv";
import path from "path";
import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize, KeyboardStyle } from "@capacitor/keyboard";

const capacitorEnv =
  process.env.CAPACITOR_ENV === "development" ? "development" : "production";

// 로그인 설정의 기존 기본값은 유지하되 광고 동기화 훅의 환경 변수에는 섞이지 않게 합니다.
const capacitorEnvironment = { ...process.env };
dotenv.config({
  path: path.resolve(__dirname, ".env.production"),
  processEnv: capacitorEnvironment,
});
dotenv.config({
  path: path.resolve(__dirname, `.env.${capacitorEnv}`),
  override: true,
  processEnv: capacitorEnvironment,
});

const config: CapacitorConfig = {
  appId: "com.nadab.app",
  appName: "나답",
  webDir: "dist",
  server: {
    androidScheme: "https",
    hostname: "nadab-fe.vercel.app",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorNaverLogin: {
      clientId: capacitorEnvironment.VITE_NAVER_CLIENT_ID,
      clientSecret: capacitorEnvironment.VITE_NAVER_CLIENT_SECRET,
      clientName: "nadab",
      urlScheme: "com.nadab.app",
    },
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: "FIT_CENTER",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound"],
    },
    Keyboard: {
      resize: KeyboardResize.None,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
