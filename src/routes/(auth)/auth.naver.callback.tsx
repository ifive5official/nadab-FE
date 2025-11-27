import { instance } from "@/lib/axios";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";

export const Route = createFileRoute("/(auth)/auth/naver/callback")({
  component: RouteComponent,
  validateSearch: z.object({
    code: z.string(),
    state: z.string(),
  }),
});

function RouteComponent() {
  const { code, state } = Route.useSearch();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore.use.setAccessToken();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await instance.post("/api/v1/auth/naver/login", {
        code,
        state,
      });
      return res.data;
    },
    // Todo: 성공 시 처리
    onSuccess: (data) => {
      const { accessToken, signupStatus } = data.data;
      setAccessToken(accessToken);
      switch (signupStatus) {
        case "PROFILE_INCOMPLETE":
          navigate({ to: "/onboarding/intro" });
          break;
        case "WITHDRAWN":
          // Todo: 회원탈퇴시 처리
          break;
        default: // COMPLETED
          navigate({ to: "/" });
      }
    },
  });

  useEffect(() => {
    // code 있을 때 자동 실행
    if (code && state) {
      mutate();
    }
  }, [code, state, mutate]);

  return <div>로그인 처리중...</div>;
}
