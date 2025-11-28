import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/LandingPage";
import useAuthStore from "@/store/authStore";

export const Route = createFileRoute("/")({
  component: () => {
    const accessToken = useAuthStore.use.accessToken();
    if (!accessToken) {
      return <LandingPage />;
    }
    return <div>HOME</div>;
  },
});
