# 보안 점검 보고서

- 점검일: 2026-09-09
- 대상: React·TanStack Query/Router·Capacitor 기반 프론트엔드, Android/iOS 설정, 의존성 잠금 파일
- 관련 문서: [리팩토링 검토 보고서](./refactoring-report.md)
- 상태: 분석 결과이며, 아래 수정 항목은 아직 적용하지 않았습니다.

## 1. 요약과 점검 범위

우선 조치 대상은 네트워크에 노출되는 Vite 개발 서버의 취약 버전, 보안 권고가 있는 의존성, 푸시 해제 실패에 종속된 로그아웃 처리입니다. Android 통신 정책과 테스트용 API의 운영 환경 접근 통제도 점검해야 합니다.

소스와 설정을 정적으로 검토하고 `pnpm audit --prod`를 실행했습니다. 운영 서버 공격 테스트, 실제 배포 APK/IPA 분석, 쿠키·보안 응답 헤더 확인은 수행하지 않았습니다. 서버의 객체별 접근 권한과 OAuth 검증 여부는 이 저장소만으로 확정할 수 없습니다.

이 문서의 심각도는 코드에서 확인한 조건과 예상 영향을 기준으로 합니다. 패키지 보안 권고의 등급은 별도로 표기하며, 해당 등급이 곧 이 앱의 실제 악용 가능성을 의미하지는 않습니다.

| ID | 심각도 | 항목 | 확인 수준 |
| --- | --- | --- | --- |
| SEC-01 | High | Vite 개발 서버의 파일 노출 위험 | 취약 버전 및 네트워크 공개 설정 확인, 실제 공격 미수행 |
| SEC-02 | 권고 기준 Critical 포함 | 보안 권고가 있는 의존성 | 잠금 파일 및 npm 보안 검사 결과 확인, 앱별 도달 가능성 추가 분석 필요 |
| SEC-03 | Medium | 푸시 해제 실패로 로그아웃 중단 | 코드 제어 흐름 확인 |
| SEC-04 | Medium | Android 평문 HTTP 허용 | 소스 Manifest 확인, 실제 평문 전송 미확인 |
| SEC-05 | Medium·설계 확인 필요 | 네이버 client secret의 앱 설정 포함 | 로컬 Android/iOS 생성 설정에 값 존재 확인 |
| SEC-06 | 서버 확인 후 확정 | 테스트용 삭제 API의 제품 코드 연결 | 프론트엔드 호출 및 메뉴 표시 조건 확인 |
| SEC-07 | Low | FileProvider 공유 경로 범위 과다 | 경로 설정 확인, 외부 접근 경로 미확인 |

## 2. 상세 결과

### SEC-01. Vite 개발 서버의 파일 노출 위험

- **위치:** [vite.config.ts](../vite.config.ts), [pnpm-lock.yaml](../pnpm-lock.yaml)
- **확인 내용:** 잠금 파일의 Vite 버전은 `7.2.1`이며 개발 서버에 `host: true`가 설정되어 있습니다. WebSocket을 비활성화하는 설정은 없습니다.

```ts
server: {
  host: true,
  port: 3000,
}
```

GHSA-p9ff-h696-f583은 네트워크에 공개된 Vite 개발 서버의 WebSocket을 통해 파일 접근 제한을 우회할 수 있는 취약점입니다. 현재 버전과 설정은 권고의 영향 조건에 해당합니다. 실제 공격에는 개발 서버에 대한 네트워크 접근이 필요하며, 정적 배포 결과물에 같은 개발 서버 취약점이 그대로 적용되는 것은 아닙니다.

**조치**

- [ ] Vite를 현재 보안 권고를 반영한 호환 버전으로 업데이트합니다. 해당 권고의 7.x 최초 수정 버전은 `7.3.2`이며, 이것이 이후 모든 권고까지 해결한다는 뜻은 아닙니다.
- [ ] 기본 개발 서버는 로컬 주소에 바인딩하고, 실기기 테스트 등 필요한 경우에만 네트워크 공개를 활성화합니다.
- [ ] 개발 서버 접근 범위를 신뢰할 수 있는 네트워크로 제한합니다.
- [ ] 업데이트 후 개발 실행, 라우트 생성, 프로덕션 빌드를 확인하고 보안 검사를 다시 실행합니다.

**참고:** [Vite 공식 보안 권고](https://github.com/vitejs/vite/security/advisories/GHSA-p9ff-h696-f583)

### SEC-02. 보안 권고가 있는 의존성

**위치:** [package.json](../package.json), [pnpm-lock.yaml](../pnpm-lock.yaml)

`pnpm audit --prod` 결과 총 89건의 보안 권고가 검출되었습니다.

| Critical | High | Moderate | Low | 합계 |
| --- | --- | --- | --- | --- |
| 3 | 52 | 31 | 3 | 89 |

주요 검출 경로는 다음과 같습니다. 수정 버전은 해당 권고의 기준이며, 변경 시점에 다른 권고도 함께 확인해야 합니다.

| 패키지 | 확인 버전 | 대표 문제 또는 유입 경로 | 해당 권고의 수정 기준 |
| --- | --- | --- | --- |
| `swiper` | `12.0.3` | Prototype pollution, 앱에서 직접 사용 | `12.1.2` 이상 |
| `seroval` | `1.3.2` | `@tanstack/react-devtools → @tanstack/devtools → solid-js → seroval`, 역직렬화 관련 권고 | GHSA-mv8w-475r-vwqw 기준 `1.5.3` 이상 |
| `tar` | `7.5.7` | `@capacitor/cli → tar`, 압축 해제·파싱 관련 서비스 거부 권고 | GHSA-23hp-3jrh-7fpw 기준 `7.5.19` 이상 |
| `axios` | `1.13.2` | Prototype pollution을 전제로 한 응답 변조 등 여러 권고 | 개별 권고와 사용 어댑터를 함께 확인 |
| `vite` | `7.2.1` | 개발 서버 파일 접근 관련 권고 | SEC-01 참고 |

`--prod` 결과에도 개발 도구가 포함됩니다. 예를 들어 일부 빌드·개발 패키지가 `dependencies`에 선언되어 있습니다. 설치 그래프에서 검출되었다는 사실과 실제 앱 번들에 포함되어 공격자 입력을 처리한다는 사실을 구분해야 합니다. Swiper와 Axios의 관련 공격 입력 경로는 이번 점검에서 입증하지 않았습니다.

**조치**

- [ ] 앱에서 사용하는 직접 의존성부터 보안 업데이트를 적용합니다.
- [ ] 하위 의존성은 상위 패키지 업데이트로 해결하는 것을 우선하고, 필요한 경우 호환성을 검토한 뒤 override를 사용합니다.
- [ ] 개발 도구의 의존성 분류와 사용 여부를 정리합니다. 분류 변경만으로 취약점이 수정되지는 않습니다.
- [ ] Capacitor CLI의 `latest` 지정 대신 검증한 버전 범위를 사용합니다.
- [ ] 잠금 파일을 함께 갱신하고 `pnpm audit --prod`, 테스트, 타입 검사, 빌드를 확인합니다.
- [ ] CI에서 보안 검사 결과와 예외 사유를 관리합니다.

**참고:** [Swiper 공식 권고](https://github.com/nolimits4web/swiper/security/advisories/GHSA-hmx5-qpq5-p643), [Axios 공식 권고](https://github.com/axios/axios/security/advisories/GHSA-pf86-5x62-jrwf), [seroval 권고](https://github.com/advisories/GHSA-mv8w-475r-vwqw), [tar 권고](https://github.com/advisories/GHSA-23hp-3jrh-7fpw)

### SEC-03. 푸시 해제 실패가 로그아웃을 막음

**위치:** [useLogoutMutation.ts](../src/features/auth/hooks/useLogoutMutation.ts), [useWithDrawMutation.ts](../src/features/auth/hooks/useWithDrawMutation.ts), [usePushManager.ts](../src/hooks/usePushManager.ts)

```ts
await unregisterPush();
await api.post("/api/v1/auth/logout");
```

`unregisterPush()` 내부의 권한 조회, 알림 제거, FCM 삭제, 서버 토큰 삭제 중 하나가 실패하면 로그아웃 API에 도달하지 못합니다. `clearAuth()`도 성공 콜백에만 있어 로컬 인증 상태가 유지됩니다. 회원탈퇴도 같은 선행 의존성이 있습니다.

추가로 서버 푸시 토큰 삭제가 `perm.receive === "granted"` 조건 안에 있어, 사용자가 알림 권한을 철회한 상태에서는 서버 토큰 정리가 생략됩니다. 서버 로그아웃 시 별도 정리가 있는지는 확인해야 합니다.

**조치**

- [ ] 푸시 정리 실패가 서버 로그아웃 시도를 막지 않도록 분리합니다.
- [ ] 로그아웃 시 로컬 토큰·개인 데이터 캐시 정리를 보장하고, 진행 중인 토큰 갱신이 인증 상태를 다시 복원하지 않도록 처리합니다.
- [ ] 서버 세션 폐기 실패를 로컬 로그아웃 완료와 구분해 처리합니다.
- [ ] 서버 푸시 토큰 삭제를 OS 알림 권한 상태에 종속시키지 않습니다.
- [ ] 회원탈퇴는 서버 삭제 성공이 확인된 경우에만 완료 화면을 표시합니다.
- [ ] FCM 실패, 알림 권한 철회, 서버 오류, 로그아웃과 토큰 갱신의 동시 실행을 검증합니다.

### SEC-04. Android 평문 HTTP 허용

**위치:** [AndroidManifest.xml](../android/app/src/main/AndroidManifest.xml)

```xml
android:usesCleartextTraffic="true"
```

앱 수준에서 평문 통신을 허용합니다. 실제 HTTP 요청이 발생하면 네트워크상의 관찰자가 내용을 읽거나 변조할 수 있습니다. 현재 앱에서 민감한 데이터가 평문으로 전송된다는 사실까지 확인한 것은 아닙니다.

**조치**

- [ ] 릴리스에서 평문 통신을 차단합니다.
- [ ] 개발에 필요한 예외는 디버그 설정과 특정 도메인으로 한정합니다.
- [ ] 최종 병합 Manifest와 실기기의 로그인·업로드·다운로드 동작을 확인합니다.

**참고:** [Android 평문 통신 보안 지침](https://developer.android.com/privacy-and-security/risks/cleartext-communications?hl=en)

### SEC-05. 네이버 client secret이 앱 설정에 포함됨

**위치:** [capacitor.config.ts](../capacitor.config.ts)

```ts
clientSecret: process.env.VITE_NAVER_CLIENT_SECRET,
```

로컬 Android/iOS의 생성된 `capacitor.config.json`에도 해당 값이 존재합니다. 실제 값은 이 문서에 포함하지 않습니다. 환경변수로 주입하거나 Git에서 제외하더라도 앱에 패키징되는 값은 추출 가능한 것으로 취급해야 합니다.

다만 네이티브 SDK가 요구하는 공개 클라이언트 설정인지, 서버만 보유해야 할 비밀값인지에 따라 조치가 달라집니다. 이 설정만으로 계정 탈취 가능성을 단정하지 않습니다.

**조치**

- [ ] 공급자와 SDK의 인증 모델을 확인하고 모바일 공개 클라이언트 설정과 서버 전용 자격 증명을 구분합니다.
- [ ] 서버 전용 secret은 앱 설정과 프론트엔드 환경변수에서 제거하고 필요한 교환 절차를 서버에서 수행합니다.
- [ ] 모바일에 포함되는 값 자체를 클라이언트 신뢰의 근거로 사용하지 않습니다.
- [ ] 서버 전용 자격 증명이 실제 배포물에 노출된 것으로 확인되면 교체하고 사용 내역을 점검합니다.

**참고:** [RFC 8252 — OAuth 2.0 for Native Apps](https://datatracker.ietf.org/doc/html/rfc8252)

### SEC-06. 테스트용 삭제 API의 운영 접근 통제 확인 필요

**위치:** [account/index.tsx](../src/routes/_authenticated/account/index.tsx), [DeveloperSection.tsx](../src/features/user/components/DeveloperSection.tsx), [useDeleteWeeklyReportMutation.ts](../src/features/report/hooks/useDeleteWeeklyReportMutation.ts)

제품 코드에 `/api/v1/test/delete/weekly-report`, `/api/v1/test/delete/monthly-report` 호출이 연결되어 있습니다. 개발자 메뉴는 환경변수와 특정 이메일을 이용해 표시 여부를 결정합니다.

메뉴 숨김은 서버 API 접근 통제를 대신하지 못합니다. 운영 서버가 해당 경로를 제공하는지, 일반 사용자 요청을 차단하는지는 이번 점검에서 확인하지 않았습니다. 따라서 권한 우회가 확정된 취약점으로 분류하지 않습니다.

**조치**

- [ ] 운영 서버에서 테스트 API를 비활성화하거나 명시적 서버 권한 검증을 적용합니다.
- [ ] 비로그인·일반 계정 요청이 데이터 변경 없이 거부되는지 통제된 환경에서 검증합니다.
- [ ] 운영 빌드에서 불필요한 테스트 UI와 삭제 기능을 제외합니다.
- [ ] QA 활성화 조건을 공통 정책으로 정리합니다.

### SEC-07. FileProvider 공유 경로 범위가 넓음

**위치:** [file_paths.xml](../android/app/src/main/res/xml/file_paths.xml)

```xml
<external-path name="my_images" path="." />
<cache-path name="my_cache_images" path="." />
```

공유 가능 경로가 외부 저장소와 캐시의 넓은 범위를 포함합니다. FileProvider는 `exported="false"`이며, 현재 설정만으로 외부 앱이 모든 파일을 읽을 수 있다는 뜻은 아닙니다. 다만 잘못된 URI 권한 부여가 발생할 경우 영향을 넓힐 수 있습니다.

**조치**

- [ ] 카메라·이미지 공유에 실제 사용하는 하위 디렉터리로 범위를 제한합니다.
- [ ] 공유 URI에 필요한 최소 권한만 부여합니다.
- [ ] 촬영·앨범 선택 기능과 공유 대상 외 파일의 접근 차단을 확인합니다.

**참고:** [Android FileProvider 보안 지침](https://developer.android.com/privacy-and-security/risks/file-providers)

## 3. 현재 적용된 보호와 미확인 영역

확인된 보호 조치는 다음과 같습니다.

- 액세스 토큰은 Zustand 메모리에 보관합니다.
- 회원가입·비밀번호 재설정 상태의 영속 저장 대상에서 비밀번호를 제외합니다.
- AI 마크다운 렌더링에 `skipHtml`을 사용하고 외부 링크에 `noopener noreferrer`를 설정합니다.
- 이미지 S3 업로드는 인증용 `api` 인스턴스와 분리된 Axios 호출을 사용합니다.

서버와 배포 환경에서 추가 확인할 항목입니다. 현재 결함이 있다고 확정한 목록은 아닙니다.

- [ ] Refresh Token 쿠키의 실제 `HttpOnly`, `Secure`, `SameSite` 속성과 세션 폐기·회전 정책
- [ ] OAuth state의 세션 바인딩·일회성 검증 및 공급자별 토큰 검증
- [ ] 비밀 댓글·리포트·PDF 작업·이미지 object key의 소유권 검사
- [ ] 로그인·인증코드·AI 생성·PDF 생성의 요청 제한과 비용 차감 무결성
- [ ] 배포 응답의 CSP 등 보안 헤더와 저장소 접근 정책

## 4. 권장 진행 순서

1. **우선:** Vite 네트워크 노출 제한 및 패치, 앱 직접 의존성 보안 업데이트, 테스트 API의 운영 접근 통제 확인
2. **다음:** 로그아웃·푸시 정리 분리, Android 평문 통신 차단, client secret의 역할과 배포 여부 확인
3. **후속:** FileProvider 범위 축소, 의존성·보안 검사 자동화, 서버 권한 검증 보강

이번 검토에서 기존 테스트 8개 파일·38개 항목과 TypeScript 검사는 통과했습니다. 이는 위 보안 위험이 없다는 증거가 아니며, 보안 수정 시 각 항목에 적은 실패 조건과 접근 통제를 별도로 검증해야 합니다.
