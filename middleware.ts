export const config = {
  // 1번 룰: /api/ 로 시작하는 요청만 이 미들웨어가 처리함
  matcher: "/api/:path*",
};

export default function middleware(request: Request) {
  const url = new URL(request.url);

  const isProd = process.env.VERCEL_ENV === "production";
  // 환경에 따라 붙여줄 백엔드 서버 주소
  const targetHost = isProd
    ? "https://r9k2m7q3.shop"
    : "https://nadab-dev.n-e.kr";

  // 결과물: https://nadab-dev.n-e.kr/api/v1/auth/login?쿼리=값
  const targetUrl = new URL(url.pathname + url.search, targetHost);

  // Vercel에게 "이 주소로 몰래 덮어씌워서 보내라"고 명령
  return new Response(null, {
    headers: {
      "x-middleware-rewrite": targetUrl.toString(),
    },
  });
}
