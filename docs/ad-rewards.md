# 광고 보상 연동

PDF 생성과 물어보기 대화권 충전의 `WALLET_INSUFFICIENT_BALANCE` 오류에서 광고 보상을 제안합니다. 웹과 설정이 없는 앱은 기존 부족 안내를 유지합니다.

## 환경 설정

`.env.admob.example`에 있는 값을 개발·운영 환경 파일 또는 CI 환경 변수에 추가합니다. 앱 ID(`~` 포함)와 보상형 광고 단위 ID(`/` 포함)는 서로 다릅니다.

| 변수 | 용도 |
| --- | --- |
| `VITE_AD_REWARDS_ENABLED` | 플랫폼별 설정이 없을 때 사용하는 공통 활성화 값. 운영은 SSV 검증 후 활성화 |
| `VITE_AD_REWARDS_ANDROID_ENABLED` | Android 활성화 여부. 공통 값보다 우선 |
| `VITE_AD_REWARDS_IOS_ENABLED` | iOS 활성화 여부. 공통 값보다 우선 |
| `VITE_ADMOB_USE_DEMO_ADS` | `true`이면 자체 광고 단위 대신 Google 데모 광고 사용 |
| `VITE_ADMOB_ANDROID_APP_ID` | Android AdMob 앱 ID |
| `VITE_ADMOB_ANDROID_REWARDED_ID` | Android 보상형 광고 단위 ID |
| `VITE_ADMOB_IOS_APP_ID` | iOS AdMob 앱 ID |
| `VITE_ADMOB_IOS_REWARDED_ID` | iOS 보상형 광고 단위 ID |

기존 `pnpm app:sync:android` / `pnpm app:sync:ios` 명령으로 빌드·동기화합니다. 개발 환경은 각각 `:dev` 스크립트를 사용합니다. `capacitor:sync:before` 훅이 `CAPACITOR_ENV`에 맞춰 네이티브 앱 ID 파일을 생성합니다. 로컬 파일은 Git에서 제외됩니다.

활성화된 환경에서 ID가 빠지거나 형식이 틀리면 동기화가 실패합니다. 비활성 환경은 SDK의 시작 오류를 방지하기 위해 Google 데모 앱 ID를 기본으로 사용하지만 광고 버튼은 표시하지 않습니다. 환경 변수 변경 후에는 웹 재빌드와 네이티브 동기화를 모두 실행해야 합니다. CI에서도 웹 빌드와 동기화에 동일한 환경 변수를 전달합니다.

네이티브 광고 설정은 Vite와 같은 순서로 `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`을 읽으며, 실행 시 전달한 환경 변수가 우선합니다. 개발 설정에서 운영 파일을 기본값으로 읽지 않습니다.

## Android 개발 테스트

개발용 API(`https://nadab-dev.n-e.kr`)에 연결하는 Android 빌드부터 확인합니다. `.env.development.local`은 Git에서 제외되며 다음 값을 사용합니다. 운영 환경과 iOS 광고는 활성화하지 않습니다.

```dotenv
VITE_AD_REWARDS_ENABLED=false
VITE_AD_REWARDS_ANDROID_ENABLED=true
VITE_AD_REWARDS_IOS_ENABLED=false
VITE_ADMOB_USE_DEMO_ADS=true
VITE_ADMOB_ANDROID_APP_ID=ca-app-pub-5637327100149211~7879133168
VITE_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-5637327100149211/9895293547
```

### 1. 광고 표시·닫힘 검증

```sh
pnpm app:sync:android:dev
cd android
./gradlew assembleDebug
```

APK는 `android/app/build/outputs/apk/debug/app-debug.apk`에 생성됩니다. Android Studio에서 `android` 프로젝트를 열고 테스트 기기로 실행할 수도 있습니다. 현재 패키지 이름은 스토어 앱과 같은 `com.nadab.app`이므로, 스토어 앱이 설치된 기기는 서명 충돌이 날 수 있습니다. 이 경우 기존 앱을 자동 삭제하지 말고 별도 에뮬레이터나 테스트 기기를 사용합니다.

1. 개발 계정으로 로그인하고 크리스탈이 부족한 상태에서 PDF 생성 또는 물어보기 대화권 충전을 시도합니다.
2. 부족 안내의 광고 보기 버튼을 누르고 Google 테스트 광고가 표시되는지 확인합니다.
3. 시청 완료·닫힘·중도 종료 후 앱으로 정상 복귀하는지 확인합니다.
4. **데모 광고는 나답 광고 단위의 SSV URL로 지급 콜백을 보내는 검증이 아닙니다.** 서버가 `REWARDED`를 반환하지 않으면 기능을 이어가지 않으며, `PENDING`이 유지되면 30초 뒤 지급 확인 지연 안내가 나타납니다. 이 단계에서 SDK 보상 이벤트로 지급을 흉내 내지 않습니다.

### 2. 개발 광고 단위의 SSV 지급 검증

1. 실기기를 AdMob **설정 → 테스트 기기**에 등록하고 반영을 기다립니다. Android 에뮬레이터는 기본 테스트 기기입니다. 이름에 `dev`가 있는 광고 단위도 별도 테스트 설정 없이는 실제 광고 단위입니다.
2. `.env.development.local`에서 `VITE_ADMOB_USE_DEMO_ADS=false`로 변경하고 개발 빌드·동기화를 다시 실행합니다. 광고 단위는 위의 `android_dev_crystal_reward`를 유지합니다.
3. 광고의 **Test Ad** 표시를 확인합니다. 개발 광고 단위의 SSV URL은 `https://nadab-dev.n-e.kr/api/v1/ad-rewards/ssv`입니다.
4. 백엔드 로그의 콜백 수신·서명 검증과 같은 `sessionKey`의 `PENDING → REWARDED` 전환을 확인합니다. 이어 지갑 갱신 및 PDF 생성 또는 대화권 충전이 한 번만 실행되는지 확인합니다. 물어보기 질문은 자동 전송되지 않아야 합니다.
5. 테스트 광고 표시와 실제 서버 지급은 각각 확인합니다. 지급이 안 되면 클라이언트에서 성공 처리하지 말고 콜백 수신 여부·세션 만료·광고 단위 허용 설정을 백엔드와 확인합니다.

참고: [Google Android 테스트 광고](https://developers.google.com/admob/android/test-ads), [SSV 검증](https://developers.google.com/admob/android/ssv).

## AdMob·백엔드 준비

### app-ads.txt 앱 인증

개발자 웹사이트는 운영 도메인 `https://nadab.app`을 사용합니다. `nadab-fe.vercel.app`은 개발 브랜치의 배포이므로 스토어의 인증용 주소로 사용하지 않습니다.

- Google Play 스토어 등록정보의 웹사이트와 App Store의 마케팅 URL에 `https://nadab.app`을 등록합니다.
- `public/app-ads.txt`에 같은 AdMob 계정의 Android·iOS 앱이 공유하는 게시자 정보를 넣었습니다.
- Vercel 설정에서 `/app-ads.txt`와 `/robots.txt`를 SPA 재작성 대상에서 제외하여 실제 텍스트 파일이 제공되도록 합니다.
- 변경 사항을 **운영 Vercel 프로젝트에 연결된 브랜치(master/main)** 에 반영하고 배포해야 `https://nadab.app/app-ads.txt`에 적용됩니다. 개발 브랜치 배포만으로는 운영 도메인에 반영되지 않습니다.
- 운영 배포 후 해당 URL이 로그인 없이 HTTP 200 및 `text/plain`으로 아래 한 줄을 반환하는지 확인합니다.

```text
google.com, pub-5637327100149211, DIRECT, f08c47fec0942fa0
```

이후 AdMob의 앱 설정에서 **앱 인증 → 업데이트 확인**을 진행합니다. 스토어 웹사이트 변경과 파일 크롤링 반영에는 시간이 걸릴 수 있습니다. 파일 인증은 광고 기능 활성화·SSV 지급 검증과 별도입니다.

참고: [Google app-ads.txt 설정 안내](https://support.google.com/admob/answer/9363762?hl=ko).

### 보상형 광고 설정

- 양 플랫폼의 보상형 광고 단위에 백엔드 SSV 콜백 URL을 등록하고 검증합니다. FE는 이 URL을 직접 호출하지 않습니다.
- 광고마다 서버에서 발급한 `sessionKey`를 `ssv.customData`로 전달합니다. `userId`는 전달하지 않습니다.
- 실제 지급량은 세션의 `rewardAmount`로 결정됩니다. SDK가 반환한 보상 수치로 잔액을 변경하지 않습니다.
- AdMob 콘솔에서 필요한 UMP 메시지를 설정합니다. 광고 요청 전에 동의 정보를 확인하며 마이페이지의 광고 개인정보 설정에서 변경할 수 있습니다. FE는 ATT 권한 창을 별도로 강제하지 않습니다.
- iOS에는 Google의 SKAdNetwork ID를 추가했습니다. 추후 미디에이션 네트워크를 추가하면 해당 네트워크가 요구하는 ID와 SDK 설정을 함께 추가합니다.

참고: [플러그인 문서](https://github.com/capacitor-community/admob), [Google SSV 설정](https://support.google.com/admob/answer/9603226?hl=ko).

## 동작과 제한

`quote → 사용자 선택 → SDK 초기화·동의 → 세션 발급 → 광고 준비·표시 → 광고 닫힘 → 서버 상태 확인 → 기존 요청 재실행` 순서입니다. 초기화가 끝나기 전에는 세션을 만들지 않습니다.

- 광고 보상·닫힘 이벤트 순서와 관계없이 서버 `REWARDED`를 확인해야 기능을 이어갑니다. 중도 종료도 같은 서버 확인을 거칩니다.
- 상태는 즉시 조회한 후 2초 간격으로 확인합니다. 30초가 지나면 지급 지연 안내와 같은 세션의 `다시 확인`을 제공합니다.
- 백그라운드에서는 조회를 중지하고, 복귀 시 같은 세션으로 새 30초 확인 구간을 시작합니다.
- 만료·광고 준비 실패 시에는 사용자가 재시도를 선택해야 새 세션을 만듭니다. 새 세션은 이전 `PENDING` 세션을 만료시키므로 지급 확인 중에는 광고 재시도를 제공하지 않습니다.
- 화면 이탈·로그아웃 시 자동 실행을 취소합니다. 앱 강제 종료 후 세션이나 원래 요청을 자동 복원하지 않습니다. 취소 이후에도 서버에서 보상이 지급될 수 있고 재진입 시 서버 잔액으로 반영됩니다.
- PDF는 실패한 요청의 기간과 구성을 보존합니다. 물어보기는 대화권만 충전하며 입력 내용과 질문 전송은 기존 화면 동작을 따릅니다.
- 보상 후 기능 요청 실패 시 기존 오류 안내를 사용합니다. 차감 요청의 네트워크 자동 재전송이나 광고 반복은 하지 않습니다.

## 검증

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

자동 테스트는 상태 전이, 서버 응답 검증, 네이티브 콜백 순서, 중복 클릭, 지연·만료·오류·취소·복귀, 기존 PDF·대화권 mutation 연결을 검증합니다. 테스트 설정은 빌드용 CSS·라우트 생성 플러그인을 실행하지 않습니다.

출시 전 양 플랫폼 실기기에서 다음을 별도로 검증합니다.

1. Google 테스트 광고로 표시·닫힘·중도 종료·네트워크 실패를 확인합니다. 테스트 광고 표시 성공만으로 SSV 지급이 검증되었다고 판단하지 않습니다.
2. 백엔드와 합의한 SSV 검증 환경에서 세션 발급, 실제 콜백 수신, `REWARDED`, 잔액 반영, 기존 기능 차감을 끝까지 확인합니다. 클라이언트 콜백을 지급 성공으로 대체하지 않습니다.
3. 실제 응답이 기존 앱과 같은 `{ data: ... }` 래퍼인지 확인합니다. 현재 API 계층은 래퍼와 필수 필드를 검증하고 누락 시 진행을 중단합니다.
4. 지연 중 복귀·화면 이동·로그아웃과 PDF 조건 보존, 대화권 충전 후 질문 입력 유지 여부를 확인합니다.
