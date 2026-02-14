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
    // SplashScreen: {
    //   launchAutoHide: true,
    //   androidScaleType: "FIT_CENTER",
    //   // splashFullScreen: true,
    //   // splashImmersive: true,
    // },
  },
};

export default config;
