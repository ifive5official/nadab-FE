import { Link, useNavigate } from "@tanstack/react-router";
import useSignupStore from "@/store/signupStore";
import BlockButton from "@/components/BlockButton";
import { NaverIcon, GoogleIcon, RoundEmailIcon } from "@/components/Icons";
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
          REDIRECT_BASE,
        ),
      };
    },
    // Todo: 에러 처리
  });

  const navigate = useNavigate();

  // 구글 SDK 설정
  useEffect(() => {
    GoogleAuth.initialize({
      scopes: ["profile", "email"],
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      grantOfflineAccess: true,
    });
  });

  async function sdkGoogleLogin() {
    try {
      const user = await GoogleAuth.signIn();
      console.log(user.authentication.idToken);
      const res = await api.post("/api/v1/auth/google/native-login", {
        googleIdToken: user.authentication.idToken,
      });
      const { accessToken, signupStatus } = res.data.data!;

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
        err.response?.data?.code ===
          "AUTH_EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_METHOD"
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

  async function sdkNaverLogin() {
    try {
      const user = await CapacitorNaverLogin.login();
      const res = await api.post("/api/v1/auth/naver/native-login", {
        naverAccessToken: user.accessToken,
      });
      const { accessToken, signupStatus } = res.data.data!;

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
        err.response?.data?.code ===
          "AUTH_EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_METHOD"
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
          className="h-[calc((112.8/796)*100dvh)] w-auto"
        />
        <div className="mt-padding-y-xxl mb-margin-y-m">
          <img
            src="/textLogo.png"
            className="h-[calc((26.76/796)*100dvh)] w-auto"
          />
        </div>
        <p className="text-label-m text-brand-primary-alpha-60">
          나에게 답하다
        </p>
      </div>
      {/* 아래 절반 */}
      <div className="flex-1 w-full flex flex-col justify-center py-padding-y-m">
        <div className="flex flex-col gap-gap-y-xl">
          <div className="flex flex-col gap-gap-y-m">
            <BlockButton
              variant="white"
              onClick={() => {
                if (Capacitor.isNativePlatform()) {
                  sdkNaverLogin();
                } else {
                  window.location.href = socialLoginUrls?.naver ?? "";
                }
              }}
            >
              <div>
                <span className="absolute left-padding-x-m">
                  <NaverIcon />
                </span>
                <span>네이버로 로그인</span>
              </div>
            </BlockButton>
            <BlockButton
              variant="white"
              onClick={() => {
                if (Capacitor.isNativePlatform()) {
                  sdkGoogleLogin();
                } else {
                  window.location.href = socialLoginUrls?.google ?? "";
                }
              }}
            >
              <div>
                <span className="absolute left-padding-x-m">
                  <GoogleIcon />
                </span>
                <span>구글로 로그인</span>
              </div>
            </BlockButton>
            <Link to="/login" onClick={reset}>
              <BlockButton variant="white">
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
