// 앱 상에서 뒤로가기 버튼과 히스토리 api 연동
// 및 두 번 누르면 종료
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";
import { type AnyRouter } from "@tanstack/react-router";

export function backButtonHandler(router: AnyRouter) {
  let lastPressTime = 0;

  const listener = App.addListener("backButton", async () => {
    const isRootPath = router.state.location.pathname === "/";

    if (!isRootPath) {
      window.history.back();
    } else {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastPressTime;

      if (timeDiff < 2000) {
        App.exitApp();
      } else {
        lastPressTime = currentTime;
        await Toast.show({
          text: "'뒤로' 버튼을 한 번 더 누르면 종료돼요.",
          duration: "short",
        });
      }
    }
  });

  return listener;
}
