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
      serverClientId:
        "650501637678-bkqh77oilfboj5kih7rhtblkoq8uv9lp.apps.googleusercontent.com", // 백엔드에서 쓰는 클라이언트 ID
      forceCodeForRefreshToken: true,
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
