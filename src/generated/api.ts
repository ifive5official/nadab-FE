// 공통 API 응답 형식

export type ApiResponse<T> = {
  status?: number;
  message?: string;
  data?: T;
};
