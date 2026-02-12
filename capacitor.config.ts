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
  },
};

export default config;
