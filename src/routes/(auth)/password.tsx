import { useLocation, createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { AnimatedOutlet } from "@/components/AnimatedOutlet";
import { SubHeader } from "@/components/Headers";

export const Route = createFileRoute("/(auth)/password")({
  component: PasswordLayout,
});

function PasswordLayout() {
  const location = useLocation();

  return (
    <div className="h-full flex flex-col">
      <SubHeader>비밀번호 변경</SubHeader>
      <AnimatePresence mode="wait" initial={false}>
        <AnimatedOutlet key={location.pathname} />
      </AnimatePresence>
    </div>
  );
}
