// axios 전역 설정
import axios from "axios";

export const instance = axios.create({
  baseURL: "https://nadab-dev.n-e.kr",
});
