import { Link } from "@tanstack/react-router";
import useSignupStore from "@/store/signupStore";
import BlockButton from "@/components/BlockButton";
import { NaverIcon, GoogleIcon, RoundEmailIcon } from "@/components/Icons";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";

type UrlRes = components["schemas"]["AuthorizationUrlResponse"];

export function LandingPage() {
  const reset = useSignupStore.use.reset();
  const { data: socialLoginUrls } = useQuery({
    queryKey: ["socialLoginUrls"],
    queryFn: async () => {
      const [naverRes, googleRes] = await Promise.all([
        api.get<ApiResponse<UrlRes>>("/api/v1/auth/naver/url"),
        api.get<ApiResponse<UrlRes>>("/api/v1/auth/google/url"),
      ]);

      const naverUrl = naverRes.data.data!.authorizationUrl;
      const googleUrl = googleRes.data.data!.authorizationUrl;
      const REDIRECT_BASE = import.meta.env.VITE_REDIRECT_BASE;

      return {
        naver: naverUrl!.replace("https://nadab-fe.vercel.app/", REDIRECT_BASE),
        google: googleUrl!.replaceAll(
          "https://nadab-fe.vercel.app/",
          REDIRECT_BASE
        ),
      };
    },
    // Todo: 에러 처리
  });

  return (
    // 헤더 높이 뺌
    // pt - 전체 레이아웃 하단 패딩때문에 중앙정렬 맞추려고 넣음..
    <div className="w-full h-[calc(100svh-var(--spacing-padding-y-m))] -mt-header-height pt-padding-y-m flex flex-col items-center">
      {/* 위 절반 */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <img
          src="/mainLogo.png"
          className="h-[calc((104.5/796)*100dvh)] w-auto"
        />
        <div className="mt-padding-y-xxl mb-margin-y-m">
          <img
            src="/textLogo.png"
            className="h-[calc((30.4/796)*100dvh)] w-auto"
          />
        </div>
        <p className="text-label-m text-brand-primary-alpha-60">
          나에게 답하다
        </p>
      </div>
      {/* 아래 절반 */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <div className="flex flex-col gap-gap-y-xl">
          <div className="flex flex-col gap-gap-y-m">
            <BlockButton
              variant="tertiary"
              onClick={() =>
                (window.location.href = socialLoginUrls?.naver ?? "")
              }
            >
              <div>
                <span className="absolute left-padding-x-m">
                  <NaverIcon />
                </span>
                <span>네이버로 로그인</span>
              </div>
            </BlockButton>
            <BlockButton
              variant="tertiary"
              onClick={() =>
                (window.location.href = socialLoginUrls?.google ?? "")
              }
            >
              <div>
                <span className="absolute left-padding-x-m">
                  <GoogleIcon />
                </span>
                <span>구글로 로그인</span>
              </div>
            </BlockButton>
            <Link to="/login" onClick={reset}>
              <BlockButton variant="tertiary">
                <div>
                  <span className="absolute left-padding-x-m">
                    <RoundEmailIcon />
                  </span>
                  <span>메일로 로그인</span>
                </div>
              </BlockButton>
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <hr className="flex-1 border-t border-border-layer-1" />
            <span className="text-text-disabled text-caption-m">또는</span>
            <hr className="flex-1 border-t border-border-layer-1" />
          </div>
          <Link to="/signup/terms" onClick={reset}>
            <BlockButton>회원가입</BlockButton>
          </Link>
          <p className="text-center text-label-s text-text-tertiary">
            가입을 진행할 경우, 이용약관과 개인정보 수집 및 이용
            <br />에 대해 동의한 것으로 간주돼요.
          </p>
        </div>
      </div>
    </div>
  );
}
