import { useLayoutEffect, type PropsWithChildren } from "react";
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

// 포털로 표시되는 팝업까지 같은 테마를 사용하도록 미리보기 문서에 적용합니다.
function PreviewTheme({ theme, children }: PropsWithChildren<{ theme: string }>) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousDark = root.classList.contains("dark");
    const previousColorScheme = root.style.colorScheme;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    return () => {
      root.classList.toggle("dark", previousDark);
      root.style.colorScheme = previousColorScheme;
    };
  }, [theme]);
  return children;
}

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    viewport: {
      options: {
        mobile360: { name: "모바일 360px", styles: { width: "360px", height: "800px" }, type: "mobile" },
        mobile390: { name: "모바일 390px", styles: { width: "390px", height: "844px" }, type: "mobile" },
        mobile430: { name: "모바일 430px", styles: { width: "430px", height: "932px" }, type: "mobile" },
      },
    },
  },
  globalTypes: {
    theme: {
      description: "앱 테마",
      toolbar: {
        title: "테마",
        icon: "paintbrush",
        items: [{ value: "light", title: "라이트" }, { value: "dark", title: "다크" }],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", viewport: { value: "mobile390", isRotated: false } },
  // 스토리 상태와 독립적으로 테마만 적용하며 실제 앱 스토어는 연결하지 않습니다.
  decorators: [(Story, context) => <PreviewTheme theme={context.globals.theme}><Story /></PreviewTheme>],
};

export default preview;
