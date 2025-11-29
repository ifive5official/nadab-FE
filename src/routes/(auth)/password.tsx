import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";

export const Route = createFileRoute("/(auth)/password")({
  component: PasswordLayout,
});

function PasswordLayout() {
  return (
    <div className="h-full flex flex-col">
      <SubHeader>비밀번호 변경</SubHeader>
      <Outlet />
    </div>
  );
}
