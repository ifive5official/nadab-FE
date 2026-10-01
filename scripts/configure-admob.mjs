import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "dotenv";

const mode = process.env.CAPACITOR_ENV === "development" ? "development" : "production";

// 환경 파일이 없는 CI에서도 전달된 환경 변수로 광고 설정을 구성합니다.
function readEnvironment(path) {
  try { return parse(readFileSync(path)); }
  catch (error) { if (error.code === "ENOENT") return {}; throw error; }
}

const env = {
  ...readEnvironment(".env"),
  ...readEnvironment(".env.production"),
  ...readEnvironment(`.env.${mode}`),
  ...process.env,
};
const enabled = env.VITE_AD_REWARDS_ENABLED === "true";
const platforms = ["ANDROID", "IOS"];
const demoAppIds = {
  ANDROID: "ca-app-pub-3940256099942544~3347511713",
  IOS: "ca-app-pub-3940256099942544~1458002511",
};

// 활성화된 앱은 앱 ID와 광고 단위 ID를 모두 요구하여 잘못된 배포를 막습니다.
function appId(platform) {
  const value = env[`VITE_ADMOB_${platform}_APP_ID`];
  const rewardedId = env[`VITE_ADMOB_${platform}_REWARDED_ID`];
  if (enabled && (!/^ca-app-pub-\d+~\d+$/.test(value ?? "") || !/^ca-app-pub-\d+\/\d+$/.test(rewardedId ?? ""))) {
    throw new Error(`${platform}: 광고 활성화에는 유효한 AdMob 앱 ID와 보상형 광고 단위 ID가 필요합니다.`);
  }
  return /^ca-app-pub-\d+~\d+$/.test(value ?? "") ? value : demoAppIds[platform];
}

const [androidId, iosId] = platforms.map(appId);
writeFileSync("android/admob.local.properties", `admobAppId=${androidId}\n`);
writeFileSync("ios/App/App/AdMob.local.xcconfig", `// 자동 생성된 AdMob 앱 ID 설정입니다.\nADMOB_APP_ID = ${iosId}\n`);
console.log(`AdMob 네이티브 설정 완료 (${mode}, 광고 보상 ${enabled ? "활성" : "비활성"})`);
