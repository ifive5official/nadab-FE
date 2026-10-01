# 리팩토링 검토 보고서

- 점검일: 2026-09-09
- 대상: 인증, 서버 상태 캐시, 업로드, PDF 화면, 푸시 알림, 개발·검증 설정
- 관련 문서: [보안 점검 보고서](./security-report.md)
- 상태: 제안 문서이며, 코드 수정은 아직 적용하지 않았습니다.

## 1. 요약

기능별 폴더와 TanStack Query 기반 데이터 계층은 이미 마련되어 있습니다. 전체 구조를 다시 만들기보다 인증·캐시의 실제 오류를 먼저 수정하고, 복잡한 화면과 플랫폼 연동을 작은 단위로 분리하는 편이 효과적입니다.

아래에서는 동작을 고치는 버그 수정과, 기존 동작을 보존하는 구조 개선을 구분합니다. P0는 우선 수정, P1은 다음 작업, P2는 후속 정리를 의미합니다.

| ID | 우선순위 | 구분 | 항목 |
| --- | --- | --- | --- |
| REF-01 | P0 | 버그 수정 + 구조 개선 | 토큰 갱신 실패·401 재시도 처리 |
| REF-02 | P0 | 버그 수정 | 게시글·댓글 좋아요 캐시 키 충돌 |
| REF-03 | P1 | 버그 수정 | 회원가입·비밀번호 재설정 저장 키 충돌 |
| REF-04 | P1 | 구조 개선 | PDF 설정 화면 분리 |
| REF-05 | P1 | 구조 개선 | 업로드 단계 및 API 응답 정규화 |
| REF-06 | P1 | 구조 개선 + 안정성 보완 | 푸시 리스너와 등록·해제 분리 |
| REF-07 | P2 | 개발 환경 개선 | 테스트와 레거시 CSS 빌드 분리 |
| REF-08 | P2 | 안정성·유지보수 개선 | API 응답 계약과 쿼리 키 통일 |
| REF-09 | P2 | 저장소 정리 | 린트, 문서, 병합 충돌 흔적 정리 |

## 2. 실제 오류를 먼저 수정할 항목

### REF-01. 토큰 갱신과 재시도 로직

**위치:** [src/lib/axios.ts](../src/lib/axios.ts), 특히 `getOrRefreshAccessToken()`과 응답 인터셉터

#### 확인된 문제

1. 갱신 중 들어온 요청은 Promise를 만들어 큐에서 기다립니다.
2. 갱신 실패 시 `queue = []`만 실행하므로 대기 중인 Promise가 resolve/reject되지 않습니다.
3. 만료 시간이 남은 토큰이 서버에서 401을 받아도 `getOrRefreshAccessToken()`이 같은 토큰을 반환합니다. 재발급 없이 거부된 토큰을 한 번 더 전송합니다.

실제 모듈에 가짜 HTTP 응답을 주입해 다음 결과를 확인했습니다. 운영 API는 호출하지 않았습니다.

| 시나리오 | 확인 결과 |
| --- | --- |
| 동시 갱신 호출 후 갱신 API 401 | 최초 호출은 `null`, 큐의 두 번째 호출은 실패 처리 이후에도 미완료 |
| 만료 전 토큰으로 일반 API 401 | Refresh 호출 0회, 동일 토큰으로 재요청 |

#### 개선 방향

- `isRefreshing`과 콜백 배열 대신 진행 중인 갱신 Promise를 공유합니다.
- 성공·실패 모두 호출자에게 결과를 전달하고 `finally`에서 공유 참조를 정리합니다.
- 경로 진입 시의 만료 검사와, 서버에서 거절된 요청의 재발급 판단을 구분합니다.
- 401을 받은 요청의 토큰과 현재 토큰을 비교해, 이미 새 토큰이 있다면 그것으로 재시도합니다. 현재 토큰도 거절된 토큰이라면 재발급을 수행합니다.
- 요청 timeout과 설정 없는 오류의 방어 처리도 검토합니다.
- 로그아웃 뒤 늦게 완료된 갱신이 토큰을 다시 저장하지 않도록 세션 종료와 조율합니다.

**검증 기준**

- [ ] 동시 요청 여러 개가 갱신 API를 한 번만 호출합니다.
- [ ] 갱신 401·403·네트워크 실패에서 모든 대기 요청이 종료됩니다.
- [ ] 유효 기간이 남아 있어도 서버가 거절한 토큰은 그대로 반복 사용하지 않습니다.
- [ ] 갱신 API 자체의 오류가 재귀 갱신을 일으키지 않습니다.
- [ ] 로그아웃과 갱신이 겹쳐도 로그아웃 후 인증 상태가 복원되지 않습니다.

### REF-02. 좋아요 캐시 키 충돌

**위치:** [src/features/social/likeQueries.ts](../src/features/social/likeQueries.ts), `likesOptions()`와 `commentLikesOptions()`

현재 키는 각각 다음과 같습니다.

```ts
["currentUser", "likes", dailyReportId]
["currentUser", "likes", commentId]
```

게시글 ID와 댓글 ID가 같으면 서로 다른 API 응답이 같은 캐시에 저장됩니다. 이전 목록이 잠시 표시되거나 다른 목록의 응답으로 캐시가 바뀔 수 있습니다.

다음처럼 자원 종류를 키에 포함하는 방식을 권합니다.

```ts
["currentUser", "posts", dailyReportId, "likes"]
["currentUser", "comments", commentId, "likes"]
```

**조치와 검증**

- [ ] 조회뿐 아니라 해당 키를 사용하는 무효화·캐시 갱신 코드를 함께 변경합니다.
- [ ] 게시글 ID와 댓글 ID가 같은 사례에서 목록이 독립적으로 유지되는지 확인합니다.
- [ ] 좋아요 추가·취소 후 올바른 목록만 갱신되는지 확인합니다.

### REF-03. 인증 단계 저장 키 충돌

**위치:** [signupStore.ts](../src/store/signupStore.ts), [resetPasswordStore.ts](../src/store/resetPasswordStore.ts)

두 store가 모두 `name: "signup-storage"`를 사용합니다. 회원가입과 비밀번호 재설정이 같은 sessionStorage 항목을 읽고 쓰기 때문에 이메일과 복원 상태가 서로 간섭할 수 있습니다. 비밀번호는 `partialize`에서 제외되어 있으므로 비밀번호 평문 저장 문제로 분류하지 않습니다.

**조치와 검증**

- [ ] 재설정 store의 키를 `reset-password-storage` 등으로 분리합니다.
- [ ] 기존 저장 데이터 처리 정책을 정하고, 다른 진행 중 흐름의 값을 임의로 삭제하지 않습니다.
- [ ] 가입 → 재설정 → 가입 이동 및 새로고침에서 각 이메일이 의도대로 복원되는지 확인합니다.

## 3. 구조 개선 항목

### REF-04. PDF 설정 화면의 책임 분리

**위치:** [src/routes/_authenticated/report/pdf.tsx](../src/routes/_authenticated/report/pdf.tsx), 점검 시 974줄

한 파일에 라우트 분기, 조건 선택, 미리보기 요청, 생성 요청, 확인 모달, 달력, 날짜 검증·계산이 함께 있습니다. 달력 수정과 API 처리 변경의 검토 범위가 불필요하게 커집니다.

권장 분리안입니다. 경로는 제안이며 현재 존재하는 파일을 의미하지 않습니다.

```text
src/routes/_authenticated/report/pdf.tsx
src/features/pdf/PdfExportSetupPage.tsx
src/features/pdf/components/PdfExportConfirmModal.tsx
src/features/pdf/components/DateRangePicker.tsx
src/features/pdf/dateRange.ts
src/features/pdf/usePdfExportSetup.ts
```

- 라우트 파일은 검색 조건 검증과 부모·자식 화면 연결을 담당합니다.
- 날짜 계산·검증은 순수 함수로 이동합니다.
- 달력과 확인 모달은 입력값과 콜백으로 동작하게 분리합니다.
- 화면 상태와 API 흐름을 별도 훅으로 묶는 것은 컴포넌트 분리 이후 복잡도를 보고 결정합니다.

**보존할 동작:** 최대 1년 범위 제한, 윤년·월말 처리, 진행 중 작업으로 이동, 실패 후 재시도 조건 복원, 크리스탈 부족 안내

**검증:** 날짜 경계의 순수 함수 테스트와 PDF 조건 선택 → 확인 → 생성 → 실패 후 재시도 흐름을 확인합니다.

### REF-05. 이미지 업로드 단계와 API 계약 분리

**위치:** [useImageUpload.ts](../src/hooks/useImageUpload.ts), [useProfileImageUpload.ts](../src/hooks/useProfileImageUpload.ts)

현재 공통 훅이 웹 파일 선택, 네이티브 카메라·앨범 선택, 크롭, 미리보기 URL, 업로드 URL 발급, S3 전송, WebP 변환 폴링을 모두 담당합니다. 특히 다음 분기는 API 주소로 응답 필드의 의미를 판단합니다.

```ts
if (apiUrl.includes("/user/me/profile-image/upload-url")) {
  presignedUrl = data?.objectKey ?? "";
  objectKey = data?.uploadUrl ?? "";
}
```

이 분기가 서버의 기존 응답을 보정하는 것인지는 확인이 필요합니다. 단순히 필드 순서를 바꾸면 기존 프로필 업로드를 깨뜨릴 수 있습니다.

**개선 방향**

- 프로필·답변 API별 어댑터에서 응답을 `{ uploadUrl, objectKey, webpKey? }`로 정규화합니다.
- 공통 업로드 로직은 엔드포인트 문자열 대신 정규화된 응답을 받습니다.
- 파일 선택·크롭 상태와 서버 업로드 단계를 나눕니다.
- 폴링에 취소 신호와 종료 시 상태 정리를 추가합니다.
- 크롭 원본과 결과 미리보기의 blob URL 수명을 각각 관리합니다.
- 크롭 좌표와 오류 타입의 `any`를 구체 타입 또는 `unknown`으로 줄입니다.

**검증:** 프로필·답변 각각의 필드 매핑, 선택 취소, 재선택, 크롭 실패, 업로드 실패, 변환 시간 초과, 화면 이탈을 확인합니다.

### REF-06. 푸시 알림 수명주기 분리

**위치:** [usePushManager.ts](../src/hooks/usePushManager.ts), [AppInitializer.tsx](../src/components/AppInitializer.tsx), 로그아웃·회원탈퇴 훅

하나의 훅에서 기기 ID 조회, 알림 채널, 리스너, 토큰 등록·해제, 배지, 화면 이동을 처리합니다. 등록과 해제에서 `removeAllListeners()`를 호출해 다른 호출자가 소유한 리스너까지 제거할 수 있습니다. 갱신되는 인증 토큰과 mutation 객체를 등록 함수의 의존성으로 사용하는 점도 재등록 여부를 점검할 필요가 있습니다.

**개선 방향**

- 앱 초기화에서 이벤트 리스너를 한 번 등록하고 반환받은 핸들만 정리합니다.
- 기기 토큰 등록·서버 연결·연결 해제를 별도 작업으로 분리합니다.
- 단순한 액세스 토큰 갱신과 실제 계정 전환을 구분합니다.
- 훅이 `main.tsx`의 router를 직접 가져오는 결합을 줄이고 화면 이동 함수를 주입합니다.
- 푸시 실패와 로그아웃의 결합은 보안 보고서 SEC-03에 따라 별도로 수정합니다.

**검증:** 앱 재진입, 계정 전환, 토큰 갱신, 알림 권한 변경에서 이벤트 중복 처리와 리스너 유실이 없는지 확인합니다.

### REF-07. 테스트와 레거시 CSS 빌드 분리

**위치:** [vite.config.ts](../vite.config.ts), [package.json](../package.json)

`pnpm test` 실행 후 `vite-plugin-tailwind-legacy`의 종료 훅이 실행되어 다음 외부 명령을 수행했습니다.

```text
npx tailwindcss@3.4.1 ... --minify
```

테스트 자체는 통과해도 레지스트리 접근 제한으로 후처리가 실패할 수 있습니다. 실제 최초 검사에서 이 상황이 발생했으며, 네트워크 접근을 허용한 재실행에서는 정상 종료했습니다. 테스트에 불필요한 생성 작업이 두 번 실행되는 것도 확인했습니다.

**개선 방향**

- 테스트 설정에서 배포용 CSS 플러그인을 제외합니다. 순수 빌드 단계와 개발·테스트 단계를 구분합니다.
- 필요한 CSS 도구를 명시적 의존성과 잠금 파일로 관리해 설치 완료 후 빌드 중 추가 다운로드를 피합니다.
- 테스트 통과와 레거시 CSS 생성 성공을 각각 명확하게 판정하도록 구성합니다.

**검증:** 의존성 설치 후 오프라인 테스트 정상 종료, 프로덕션 CSS 생성, 지원 대상 구형 브라우저의 화면을 확인합니다.

### REF-08. API 응답 계약과 쿼리 키 정리

**위치:** [generated/api.ts](../src/generated/api.ts), [features/pdf/api.ts](../src/features/pdf/api.ts), [features/pdf/queries.ts](../src/features/pdf/queries.ts), 기능별 `queries.ts`

공통 응답의 `data`는 optional인데 여러 호출부가 `data!`로 접근합니다. 타입 단언은 실제 응답 검증을 하지 않습니다. PDF 상태 조회는 `undefined`를 반환할 수 있어 린트의 `no-void-query-fn` 오류도 발생했습니다.

**개선 방향**

- 정상 응답에 필수인 `data`는 API 경계에서 확인하고, 없으면 명시적인 오류로 처리합니다.
- 업무상 데이터 없음이 정상인 API는 `null`, 빈 목록 등 의미가 분명한 값을 반환하도록 정합니다.
- 인증·PDF·업로드 등 중요한 경계부터 런타임 검증을 적용합니다.
- [ask/queries.ts](../src/features/ask/queries.ts)의 `askChatKeys`처럼 기능별 쿼리 키를 한곳에서 정의합니다.
- 반복되는 서버 오류 코드를 공통 처리하되, 기능별 안내 문구와 처리 방식은 유지합니다.

**검증:** 필수 데이터 누락과 정상적인 빈 응답을 구분하고, 변경한 쿼리 키의 조회·무효화·직접 갱신을 함께 확인합니다.

### REF-09. 린트·문서·저장소 정리

점검 당시 `pnpm exec eslint src --format json` 결과는 오류 2개, 경고 3개였습니다.

| 파일 | 등급 | 내용 |
| --- | --- | --- |
| [AppInitializer.tsx](../src/components/AppInitializer.tsx) | 오류 | 사용하지 않는 catch 변수 `e` |
| [features/pdf/queries.ts](../src/features/pdf/queries.ts) | 오류 | 쿼리 함수가 `undefined`를 반환할 수 있음 |
| [AppInitializer.tsx](../src/components/AppInitializer.tsx) | 경고 | 불필요한 ESLint 비활성화 주석 |
| [InputAccessoryView.tsx](../src/components/InputAccessoryView.tsx) | 경고 | effect의 `isNative` 의존성 누락 |
| [createSelectors.ts](../src/store/createSelectors.ts) | 경고 | 불필요한 ESLint 비활성화 주석 |

추가 정리 항목입니다.

- [ ] [`.gitignore`](../.gitignore)에 남은 `<<<<<<<`, `=======`, `>>>>>>>` 병합 충돌 마커를 정리하고 의도한 ignore 규칙을 확인합니다.
- [ ] [README.md](../README.md)의 기본 템플릿을 실제 pnpm 개발·빌드·네이티브 동기화 절차로 교체합니다. 현재 안내의 `npm run start`는 package.json에 없습니다.
- [ ] 환경변수 예시에는 이름과 용도만 기록하고 실제 자격 증명은 넣지 않습니다.
- [ ] 타입 검사·린트·테스트를 팀의 기본 검증 명령으로 문서화합니다.

## 4. 권장 작업 단위

1. **인증 오류 수정:** REF-01 및 보안 보고서 SEC-03을 함께 다루고, 갱신·로그아웃 동시 실행을 검증합니다.
2. **캐시·저장 키 충돌 수정:** REF-02, REF-03을 각각 작은 변경으로 처리합니다.
3. **PDF 분리:** 먼저 날짜 유틸과 화면 요소를 이동하고, 동작 변경은 별도 변경으로 분리합니다.
4. **업로드·푸시 정리:** 플랫폼별 기존 동작을 확인하면서 각각 진행합니다.
5. **검증 환경과 API 계약 정리:** 테스트 빌드 부작용, 린트 오류, 중요한 응답 경계부터 해결합니다.

새 함수·컴포넌트를 추가할 때는 저장소 규칙에 따라 한국어로 목적을 짧게 주석으로 남깁니다. 단순 파일 이동·문서 정리에는 별도 테스트를 늘리지 않고, 인증 경쟁 상태·캐시 충돌·날짜 경계처럼 실패 조건이 명확한 부분에 테스트를 집중합니다.

## 5. 기존 검증 결과와 한계

| 검증 | 결과 |
| --- | --- |
| `pnpm test` | 8개 파일·38개 테스트 통과, 네트워크 허용 후 종료 훅까지 정상 완료 |
| `pnpm exec tsc --noEmit` | 통과 |
| `pnpm exec eslint src --format json` | 오류 2개·경고 3개 |
| 인증 모듈의 모의 HTTP 재현 | 갱신 실패 후 대기 요청 미완료, 401 후 동일 토큰 재사용 확인 |

기존 테스트는 AI 대화·리포트 표시·코치마크 등에 집중되어 있습니다. 이번에 확인한 인증·캐시 문제와 네이티브 플랫폼 동작이 기존 테스트 통과만으로 검증된 것은 아닙니다. 이 문서는 앞선 코드 검토 결과를 정리한 것으로, 문서 작성 단계에서 앱 동작을 변경하지 않았습니다.
