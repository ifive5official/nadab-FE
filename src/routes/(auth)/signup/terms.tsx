import { createFileRoute, useNavigate } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import clsx from "clsx";
import { useState } from "react";
import useSignupStore from "@/store/signupStore";
import StepTitle from "@/features/auth/StepTitle";
import {
  AgreementCheckboxIcon,
  SelectAllCheckboxIcon,
} from "@/components/Icons";
import { getNextStepPath } from "@/features/auth/signupSteps";
import { useTermsConsentMutation } from "@/features/auth/hooks/useTermsConsentMutation";

type SignupSearch = {
  type?: "social" | "renewal";
};

export const Route = createFileRoute("/(auth)/signup/terms")({
  component: Terms,
  validateSearch: (search: Record<string, unknown>): SignupSearch => {
    return {
      type: (search.type as "social" | "renewal") || undefined,
    };
  },
});

function Terms() {
  const { type } = Route.useSearch();

  const updateIsRequiredTermsAgreed =
    useSignupStore.use.updateIsRequiredTermsAgreed();
  const updateIsMarketingTermsAgreed =
    useSignupStore.use.updateIsMarketingTermsAgreed();

  const initialItems = [
    {
      isRequired: true,
      title: (
        <>
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href="https://peat-language-671.notion.site/2a93409bb9b680df9622d528417a6f5b"
            onClick={(e) => e.stopPropagation()}
          >
            서비스 이용약관
          </a>
          에 동의해요
        </>
      ),
      isAgreed: false,
    },
    {
      isRequired: true,
      title: (
        <>
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href="https://peat-language-671.notion.site/2a03409bb9b6808bba61fffff6d03c56"
            onClick={(e) => e.stopPropagation()}
          >
            개인정보 처리 방침
          </a>
          에 동의해요.
        </>
      ),
      isAgreed: false,
    },
    {
      isRequired: true,
      title: "만 14세 이상이에요.",
      isAgreed: false,
    },
    {
      isRequired: false,
      title: "마케팅 정보 수신에 동의해요.",
      isAgreed: false,
    },
  ];
  const [items, setItems] = useState(initialItems);
  const isAllAgreed = items.every((item) => item.isAgreed);
  const isAllRequiredAgreed = items.every((item) => {
    if (item.isRequired) {
      return item.isAgreed;
    } else {
      return true;
    }
  });

  const navigate = useNavigate();

  const termsconsentMutation = useTermsConsentMutation({});

  return (
    <div>
      <div className="py-padding-y-m">
        <StepTitle>서비스 이용약관에 동의해주세요.</StepTitle>
      </div>

      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <button
          className="flex items-center gap-gap-x-s text-button-1 text-text-primary px-padding-x-s py-padding-y-s border border-border-base rounded-[20px]"
          onClick={() => {
            setItems((prev) =>
              prev.map((item) => ({ ...item, isAgreed: !isAllAgreed })),
            );
          }}
        >
          <span
            className={clsx({
              "text-icon-disabled": !isAllAgreed,
              "text-icon-primary": isAllAgreed,
            })}
          >
            <SelectAllCheckboxIcon />
          </span>
          <p>약관 모두 동의하기</p>
        </button>
        <ul className="flex flex-col justify-center gap-gap-y-s">
          {items.map((item, idx) => {
            return (
              <li
                key={idx}
                className={clsx(
                  "cursor-pointer flex items-center gap-gap-x-s px-padding-x-xs py-padding-y-xs",
                  {
                    "text-text-disabled": !item.isAgreed,
                    "text-text-primary": item.isAgreed,
                  },
                )}
                onClick={() => {
                  setItems((prev) =>
                    prev.map((innerItem, i) => {
                      if (idx === i) {
                        return { ...innerItem, isAgreed: !innerItem.isAgreed };
                      } else {
                        return innerItem;
                      }
                    }),
                  );
                }}
              >
                <button
                  className={clsx({
                    "text-icon-disabled": !item.isAgreed,
                    "text-icon-primary": item.isAgreed,
                  })}
                >
                  <AgreementCheckboxIcon />
                </button>
                <span className="text-label-l">
                  {item.isRequired === true ? "필수" : "선택"}
                </span>
                <p className="text-caption-l">{item.title}</p>
              </li>
            );
          })}
        </ul>

        <BlockButton
          disabled={!isAllRequiredAgreed}
          onClick={() => {
            const isMarketingTermsAgreed = items.find(
              (item) => item.title === "마케팅 정보 수신에 동의해요.",
            )!.isAgreed;
            switch (type) {
              case "social":
                // 소셜 로그인 - 약관 동의 api 호출 + 온보딩으로 이동
                termsconsentMutation.mutate({
                  isMarketingTermsAgreed,
                });
                navigate({ to: "/onboarding/intro" });
                break;
              case "renewal":
                // 약관 재동의 - 약관 동의 api 호출 + 홈으로 이동
                termsconsentMutation.mutate({
                  isMarketingTermsAgreed,
                });
                navigate({ to: "/" });
                break;
              default:
                // 일반 회원가입 - 다음 회원가입 단계로 이동
                updateIsRequiredTermsAgreed();
                if (isMarketingTermsAgreed) {
                  updateIsMarketingTermsAgreed();
                }
                navigate({ to: getNextStepPath("terms") });
            }
          }}
          isLoading={termsconsentMutation.isPending}
        >
          완료
        </BlockButton>

        {/* eslint-disable react/no-unescaped-entities */}
        <div className="flex flex-col gap-gap-y-s">
          <p className="text-label-s text-center text-text-tertiary">
            '선택' 항목에 동의를 해주시면
            <br />
            나답이 매일 오늘의 질문을 잊지 않도록 알려드릴게요.
          </p>
          <p className="text-caption-s text-text-disabled text-center">
            '선택' 항목에 동의하지 않아도 서비스 이용이 가능해요.
            <br />
            개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며,
            <br />
            동의 거부시 회원제 서비스 이용이 제한돼요.
          </p>
        </div>
      </div>
    </div>
  );
}
