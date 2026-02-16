import "dotenv/config";
import type { CapacitorConfig } from "@capacitor/cli";

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
    // SplashScreen: {
    //   launchAutoHide: true,
    //   androidScaleType: "FIT_CENTER",
    //   // splashFullScreen: true,
    //   // splashImmersive: true,
    // },
  },
};

export default config;
