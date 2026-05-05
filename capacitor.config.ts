import * as dotenv from "dotenv";
import path from "path";
import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

dotenv.config({ path: path.resolve(__dirname, ".env.production") });

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
      clientId: process.env.VITE_NAVER_CLIENT_ID,
      clientSecret: process.env.VITE_NAVER_CLIENT_SECRET,
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
    },
  },
};

export default config;
