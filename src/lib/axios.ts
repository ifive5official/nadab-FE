// axios 전역 설정
import useAuthStore from "@/store/authStore";
import axios from "axios";

export const api = axios.create({
  baseURL: "/",
  withCredentials: true, // refresh token 쿠키 포함
});

// 항상 access token을 요청 헤더에 붙임
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let queue: ((token: string) => void)[] = []; // 요청 재시도 함수들의 큐

// 401 처리 + 자동 리프레시
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // 루트 라우트에서 리프레시 할 때 무한루프 방지
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // 401이면서 refresh 아닌 요청일 때만
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 refresh 중이면 큐에 넣음
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh Token은 HttpOnly 쿠키로 자동 전송
        const res = await api.post("/api/v1/auth/refresh");

        // access token 재설정
        const newAccessToken = res.data.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 대기 중인 요청들 다시 실행
        queue.forEach((cb) => cb(newAccessToken));
        queue = [];

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.log(err);
        queue = [];

        // Refresh Token도 만료되면, 강제 로그아웃
        useAuthStore.getState().clearAuth();
        // window.location.href = "/";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
