// axios 전역 설정
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { Capacitor } from "@capacitor/core";

export const api = axios.create({
  baseURL: Capacitor.isNativePlatform() ? "https://nadab-dev.n-e.kr" : "/",
  withCredentials: true, // refresh token 쿠키 포함
});

let isRefreshing = false;
let queue: ((token: string) => void)[] = []; // 요청 재시도 함수들의 큐

export const getOrRefreshAccessToken = async (): Promise<string | null> => {
  const { accessToken, setAccessToken, clearAuth } = useAuthStore.getState();

  // 1. 이미 토큰이 있다면 바로 반환
  if (accessToken) return accessToken;

  // 2. 이미 다른 곳에서 리프레시 중이라면 큐에서 대기
  if (isRefreshing) {
    return new Promise((resolve) => {
      queue.push((token: string) => resolve(token));
    });
  }

  // 3. 리프레시 시작
  isRefreshing = true;

  try {
    const res = await api.post("/api/v1/auth/refresh");
    const newAccessToken = res.data.data.accessToken;
    setAccessToken(newAccessToken);

    // 대기 중인 요청들에 새 토큰 전달
    queue.forEach((cb) => cb(newAccessToken));
    queue = [];
    return newAccessToken;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    queue = [];
    clearAuth();
    return null;
  } finally {
    isRefreshing = false;
  }
};

// 항상 access token을 요청 헤더에 붙임
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// 401 처리 + 자동 리프레시
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // 루트 라우트에서 리프레시 할 때 무한루프 방지
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 분리한 함수 호출 (공유된 상태를 사용함)
      const newToken = await getOrRefreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);
