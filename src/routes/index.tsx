import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/LandingPage";
import Home from "@/features/Home/Home";
import useAuthStore from "@/store/authStore";

export const Route = createFileRoute("/")({
  component: () => {
    const accessToken = useAuthStore.use.accessToken();
    if (!accessToken) {
      return <LandingPage />;
    }
    return <Home />;
  },
});
