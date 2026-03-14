import * as dotenv from "dotenv";
import path from "path";
import type { CapacitorConfig } from "@capacitor/cli";

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
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: process.env.VITE_GOOGLE_CLIENT_ID,
      forceCodeForRefreshToken: true,
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
  },
};

export default config;
