import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = fileURLToPath(new URL("./configure-admob.mjs", import.meta.url));
let directory: string;

// 실제 프로젝트의 환경 파일을 건드리지 않고 네이티브 동기화 설정을 실행합니다.
function configure(mode: string) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("VITE_")));
  return execFileSync(process.execPath, [script], {
    cwd: directory, env: { ...env, CAPACITOR_ENV: mode }, encoding: "utf8", stdio: "pipe",
  });
}

describe("AdMob 네이티브 환경 설정", () => {
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "nadab-admob-"));
    mkdirSync(join(directory, "android"));
    mkdirSync(join(directory, "ios/App/App"), { recursive: true });
    writeFileSync(join(directory, ".env.development.local"), [
      "VITE_AD_REWARDS_ANDROID_ENABLED=true",
      "VITE_AD_REWARDS_IOS_ENABLED=false",
      "VITE_ADMOB_ANDROID_APP_ID=ca-app-pub-1~2",
      "VITE_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-1/3",
    ].join("\n"));
  });
  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it("개발용 로컬 설정으로 iOS ID 없이 Android만 동기화한다", () => {
    expect(configure("development")).toContain("ANDROID 활성, IOS 비활성");
    expect(readFileSync(join(directory, "android/admob.local.properties"), "utf8")).toContain("ca-app-pub-1~2");
  });

  it("운영 동기화에는 개발용 활성화 설정과 앱 ID가 들어가지 않는다", () => {
    expect(configure("production")).toContain("ANDROID 비활성, IOS 비활성");
    expect(readFileSync(join(directory, "android/admob.local.properties"), "utf8")).not.toContain("ca-app-pub-1~2");
  });

  it("활성 플랫폼의 광고 단위가 잘못되면 동기화를 중단한다", () => {
    writeFileSync(join(directory, ".env.development.local"), "VITE_AD_REWARDS_ANDROID_ENABLED=true\nVITE_ADMOB_ANDROID_APP_ID=ca-app-pub-1~2\n");
    expect(() => configure("development")).toThrow("ANDROID: 광고 활성화에는 유효한 AdMob 앱 ID와 보상형 광고 단위 ID가 필요합니다.");
  });
});
