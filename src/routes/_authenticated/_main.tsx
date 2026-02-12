import { MainHeader } from "@/components/Headers";
import Tabs from "@/components/Tabs";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  return (
    <>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <div className="flex-1 flex flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Tabs />
        <Outlet />
      </div>
    </>
  );
}
