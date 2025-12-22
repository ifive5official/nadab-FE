import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import useAuthStore from "@/store/authStore";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/password")({
  component: PasswordLayout,
  beforeLoad: async () => {
    // 로그인 시 진입 불가
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      throw redirect({ to: "/" });
    }
  },
});

function PasswordLayout() {
  return (
    <div className="h-full flex flex-col">
      <SubHeader showMenuButton={false}>비밀번호 변경</SubHeader>
      <Outlet />
    </div>
  );
}
