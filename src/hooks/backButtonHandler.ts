// 앱 상에서 뒤로가기 버튼과 히스토리 api 연동
// 및 두 번 누르면 종료
import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";
import { useRouter } from "@tanstack/react-router";

export function BackButtonHandler() {
  const router = useRouter();
  const lastPressTime = useRef<number>(0);

  useEffect(() => {
    const backHandler = App.addListener("backButton", async () => {
      // 1. 현재 경로가 루트('/')인지 확인
      // TanStack Router의 state를 통해 현재 위치를 파악합니다.
      const isRootPath = router.state.location.pathname === "/";

      // 2. 뒤로 갈 히스토리가 있는 경우 (루트가 아닐 때)
      if (!isRootPath) {
        window.history.back();
      }
      // 3. 루트 경로에서 뒤로가기를 눌렀을 때 (종료 로직)
      else {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastPressTime.current;

        if (timeDiff < 2000) {
          // 2초 이내에 다시 누르면 앱 종료
          App.exitApp();
        } else {
          // 처음 누르면 토스트 출력 및 시간 저장
          lastPressTime.current = currentTime;
          await Toast.show({
            text: "'뒤로' 버튼을 한 번 더 누르면 종료돼요.",
            duration: "short",
          });
        }
      }
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      backHandler.then((h) => h.remove());
    };
  }, [router]);

  return null;
}
