import { instance } from "@/lib/axios";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

export const Route = createFileRoute("/(auth)/auth/google/callback")({
  component: RouteComponent,
  validateSearch: z.object({
    code: z.string(),
    state: z.string(),
  }),
});

function RouteComponent() {
  const { code, state } = Route.useSearch();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await instance.post("/api/v1/auth/google/login", {
        code,
        state,
      });
      return res.data;
    },
    // Todo: 성공 시 처리
  });

  useEffect(() => {
    // code 있을 때 자동 실행
    if (code && state) {
      mutate();
    }
  }, [code, state, mutate]);

  return <div>로그인 처리중...</div>;
}
