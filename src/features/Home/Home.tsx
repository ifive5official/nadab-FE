import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";

export default function Home() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore.use.clearAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      //   Todo: 사용자 관련 캐시 제거
      navigate({ to: "/" });
    },
    // Todo: 에러 처리
  });
  return (
    <div>
      <p>홈</p>
      <button onClick={() => logoutMutation.mutate()}>로그아웃(임시)</button>
    </div>
  );
}
