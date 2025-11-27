import { Link } from "@tanstack/react-router";
import useSignupStore from "@/store/signupStore";
import BlockButton from "@/components/BlockButton";
import { NaverIcon, GoogleIcon, RoundEmailIcon } from "@/components/Icons";
import { ColoredMainLogo, ColoredTextLogo } from "@/components/Logos";
import { instance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function LandingPage() {
  const reset = useSignupStore.use.reset();
  const { data: socialLoginUrls } = useQuery({
    queryKey: ["socialLoginUrls"],
    queryFn: async () => {
      const isDev = import.meta.env.DEV;
      const [naverRes, googleRes] = await Promise.all([
        instance.get("/api/v1/auth/naver/url"),
        instance.get("/api/v1/auth/google/url"),
      ]);
      const naverUrl = naverRes.data.data.authorizationUrl;
      const googleUrl = googleRes.data.data.authorizationUrl;

      return {
        naver: isDev
          ? naverUrl.replace(
              "https://nadab-fe.vercel.app/",
              "http://localhost:3000/"
            )
          : naverUrl,

        google: isDev
          ? googleUrl.replaceAll(
              "https://nadab-fe.vercel.app/",
              "http://localhost:3000/"
            )
          : googleUrl,
      };
    },
    initialData: {
      naver: "",
      google: "",
    },
    // Todo: 에러 처리
  });

  return (
    // pt - 전체 레이아웃 하단 패딩때문에 중앙정렬 맞추려고 넣음..
    <div className="w-full h-full flex flex-col items-center pt-padding-y-m">
      {/* 위 절반 */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <ColoredMainLogo style={{ height: `${(180 / 796) * 100}dvh` }} />
        <div className="mt-margin-y-xl mb-margin-y-s">
          <ColoredTextLogo style={{ height: `${(36 / 796) * 100}dvh` }} />
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
              onClick={() => (window.location.href = socialLoginUrls?.naver)}
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
              onClick={() => (window.location.href = socialLoginUrls?.google)}
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
            <br />에 대해 동의한 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
