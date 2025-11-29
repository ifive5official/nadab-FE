import useAuthStore from "@/store/authStore";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { api } from "@/lib/axios";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const { accessToken, setAccessToken } = useAuthStore.getState();
    if (!accessToken) {
      try {
        const res = await api.post("/api/v1/auth/refresh");
        const newAccessToken = res.data.data?.accessToken ?? null;
        setAccessToken(newAccessToken);
      } catch (err) {
        // Todo: 아무 처리도 안 하는 게 제일 나은가...
        console.log(err);
      }
    }
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="min-h-dvh w-vw flex bg-surface-base">
        {/* 하단 패딩 넣은 이유 - 모바일 사파리 하단바 때문에 안 띄우면 이상함ㅜㅜ */}
        <div className="w-dvw sm:w-[412px] sm:mx-auto px-padding-x-m pb-padding-y-m overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </>
  );
}
