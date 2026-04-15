import { Link, useNavigate } from "@tanstack/react-router";
import useSignupStore from "@/store/signupStore";
import { NaverIcon, KakaoIcon, AppleIcon } from "@/components/Icons";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { CapacitorNaverLogin } from "@team-lepisode/capacitor-naver-login";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import useModalStore from "@/store/modalStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor3KakaoLogin } from "capacitor3-kakao-login";
import clsx from "clsx";
import {
  SignInWithApple,
  type SignInWithAppleResponse,
} from "@capacitor-community/apple-sign-in";

type UrlRes = components["schemas"]["AuthorizationUrlResponse"];

export function LandingPage() {
  const reset = useSignupStore.use.reset();
  const { data: socialLoginUrls } = useQuery({
    queryKey: ["socialLoginUrls"],
    queryFn: async () => {
      const [naverRes, googleRes, kakaoRes] = await Promise.all([
        api.get<ApiResponse<UrlRes>>("/api/v1/auth/naver/url"),
        api.get<ApiResponse<UrlRes>>("/api/v1/auth/google/url"),
        api.get<ApiResponse<UrlRes>>("/api/v1/auth/kakao/url"),
      ]);

      const naverUrl = naverRes.data.data!.authorizationUrl;
      const googleUrl = googleRes.data.data!.authorizationUrl;
      const kakaoUrl = kakaoRes.data.data!.authorizationUrl;
      const REDIRECT_BASE = import.meta.env.VITE_REDIRECT_BASE;

      return {
        naver: naverUrl!.replace("https://nadab-fe.vercel.app/", REDIRECT_BASE),
        google: googleUrl!.replaceAll(
          "https://nadab-fe.vercel.app/",
          REDIRECT_BASE,
        ),
        kakao: kakaoUrl!.replaceAll(
          "https://nadab-fe.vercel.app/",
          REDIRECT_BASE,
        ),
      };
    },
    // Todo: 에러 처리
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();

      // 구글 SDK 설정
      const clientId =
        platform === "ios"
          ? import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS
          : import.meta.env.VITE_GOOGLE_CLIENT_ID_ANDROID;

      GoogleAuth.initialize({
        scopes: ["profile", "email"],
        clientId: clientId,
        grantOfflineAccess: true,
      });

      // 카카오 SDK 설정
      Capacitor3KakaoLogin.initializeKakao({
        app_key: import.meta.env.VITE_KAKAO_APP_KEY,
        web_key: import.meta.env.VITE_KAKAO_WEB_KEY,
      });
    }
  }, []);

  async function handleNativeLogin(
    provider: "google" | "naver" | "kakao" | "apple",
  ) {
    try {
      let res;
      switch (provider) {
        case "google":
          {
            const user = await GoogleAuth.signIn();
            res = await api.post("/api/v1/auth/google/native-login", {
              googleIdToken: user.authentication.idToken,
            });
          }
          break;
        case "naver":
          {
            const user = await CapacitorNaverLogin.login();
            res = await api.post("/api/v1/auth/naver/native-login", {
              naverAccessToken: user.accessToken,
            });
          }
          break;
        case "kakao":
          {
            const user = await Capacitor3KakaoLogin.kakaoLogin();
            res = await api.post("/api/v1/auth/kakao/native-login", {
              kakaoAccessToken: user.value,
            });
          }
          break;
        case "apple":
          {
            const result: SignInWithAppleResponse =
              await SignInWithApple.authorize({
                clientId: "com.nadab.app",
                redirectURI: "/",
                scopes: "email name",
              });

            res = await api.post("/api/v1/auth/apple/native-login", {
              code: result.response.authorizationCode,
            });
          }
          break;
      }

      const { accessToken, signupStatus } = res!.data.data!;

      useAuthStore.getState().setAccessToken(accessToken!);

      if (signupStatus === "PROFILE_INCOMPLETE") {
        navigate({
          to: "/signup/terms",
          replace: true,
          search: { type: "social" },
        });
      }
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.code.startsWith(
          "AUTH_EMAIL_ALREADY_REGISTERED_WITH_",
        )
      ) {
        // 이미 일반 로그인으로 가입한 계정일 시
        useModalStore
          .getState()
          .showError("이미 가입한 계정이에요.", "다른 계정으로 가입해보세요.");
      } else if (axios.isAxiosError(err)) {
        handleDefaultApiError(err);
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col px-padding-x-m">
      {/* 위 절반 */}
      <div className="pt-padding-y-m flex-1 flex flex-col justify-center items-center">
        <img
          src="/mainLogo.png"
          className="h-[calc((111.8/796)*100*var(--dvh))] w-auto"
        />
        <div className="mt-padding-y-xxl mb-margin-y-m">
          <img
            src="/textLogo.png"
            className="h-[calc((26.76/796)*100*var(--dvh))] w-auto"
          />
        </div>
        <p className="text-label-m text-brand-primary-alpha-60">
          나에게 답하다
        </p>
      </div>
      {/* 아래 절반 */}
      <div className="flex-1 w-full flex flex-col justify-center py-padding-y-m">
        <div className="flex flex-col gap-gap-y-m">
          <SocialLoginButton
            onNativeClick={() => handleNativeLogin("naver")}
            url={socialLoginUrls?.naver}
            icon={NaverIcon}
            title="네이버로 로그인"
            className="bg-[#03C75A] text-white"
          />
          <SocialLoginButton
            onNativeClick={() => handleNativeLogin("kakao")}
            url={socialLoginUrls?.kakao}
            icon={KakaoIcon}
            title="카카오로 로그인"
            className="bg-[#FEE500] text-[#0D0000]"
          />
          <SocialLoginButton
            onNativeClick={() => handleNativeLogin("google")}
            url={socialLoginUrls?.google}
            icon={() => (
              <img className="w-3.5 aspect-square" src="icon/googleIcon.png" />
            )}
            title="구글로 로그인"
            className="bg-[#F2F2F2] text-[#1F1F1F]"
          />
          {Capacitor.getPlatform() === "ios" && (
            <SocialLoginButton
              onNativeClick={() => handleNativeLogin("apple")}
              icon={AppleIcon}
              title="Apple로 로그인"
              className="bg-black dark:bg-white text-white border dark:text-black border-[#4D4D4D]"
            />
          )}
        </div>
        <div className="pt-padding-y-l pb-padding-y-xs flex flex-col gap-gap-y-l">
          <div className="flex items-center gap-5">
            <hr className="flex-1 border-t border-border-layer-1" />
            <span className="text-text-disabled text-caption-m">또는</span>
            <hr className="flex-1 border-t border-border-layer-1" />
          </div>
          <div className="flex justify-center gap-gap-x-xl underline text-label-m">
            <Link to="/signup/terms" onClick={reset}>
              회원가입
            </Link>
            <Link to="/login" onClick={reset}>
              이메일로 로그인
            </Link>
          </div>
          <p className="text-center text-label-s text-text-tertiary">
            가입을 진행할 경우,{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://peat-language-671.notion.site/2a93409bb9b680df9622d528417a6f5b"
              onClick={async (e) => {
                e.stopPropagation();
                if (Capacitor.isNativePlatform()) {
                  e.preventDefault();
                  await Browser.open({
                    url: "https://peat-language-671.notion.site/2a93409bb9b680df9622d528417a6f5b",
                  });
                }
              }}
            >
              이용약관
            </a>
            과{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://peat-language-671.notion.site/2a03409bb9b6808bba61fffff6d03c56"
              onClick={async (e) => {
                e.stopPropagation();
                if (Capacitor.isNativePlatform()) {
                  e.preventDefault();
                  await Browser.open({
                    url: "https://peat-language-671.notion.site/2a03409bb9b6808bba61fffff6d03c56",
                  });
                }
              }}
            >
              개인정보 수집 및 이용
            </a>
            <br />에 대해 동의한 것으로 간주돼요.
          </p>
        </div>
      </div>
    </div>
  );
}

type SocialLoginButtonProps = {
  onNativeClick: () => void;
  icon: React.ComponentType;
  title: string;
  url?: string;
  className: string; // 글자색 및 배경색
};

function SocialLoginButton({
  onNativeClick,
  icon: Icon,
  title,
  url,
  className,
}: SocialLoginButtonProps) {
  return (
    <button
      className={clsx(
        "py-padding-y-m rounded-[14px] flex items-center justify-center gap-[5px] font-semibold text-[19px] leading-6",
        className,
      )}
      onClick={() => {
        if (Capacitor.isNativePlatform()) {
          onNativeClick();
        } else {
          window.location.href = url ?? "";
        }
      }}
    >
      <Icon />
      <span>{title}</span>
    </button>
  );
}
