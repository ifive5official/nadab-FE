import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import categories from "@/constants/categories";
import StepTitle from "@/features/auth/StepTitle";
import clsx from "clsx";
import { useState } from "react";
import useOnboardingStore from "@/store/onboardingStore";
import { getNextStepPath } from "@/features/auth/signupSteps";
import { useUpdateInterestMutation } from "@/features/user/hooks/useUpdateInterestMutation";
import { QuestionBadge } from "@/components/Badges";

export const Route = createFileRoute("/(auth)/onboarding/category")({
  component: Category,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { hasSeenIntro } = useOnboardingStore.getState();
    if (!hasSeenIntro) {
      throw redirect({ to: "/onboarding/intro" });
    }
  },
});

function Category() {
  const updateCategory = useOnboardingStore.use.updateCategory();
  const [items, setItems] = useState(
    categories.map((category) => ({ ...category, isSelected: false })),
  );
  const selectedItem = items.find((item) => item.isSelected);
  const navigate = useNavigate();

  const categoryMutation = useUpdateInterestMutation({
    onSuccess: (interestCode: string) => {
      updateCategory(interestCode);
      const nextStep = getNextStepPath("category");
      navigate({ to: nextStep });
    },
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="py-padding-y-m flex flex-col gap-gap-y-l">
            <StepTitle>
              당신의 어떤 이야기부터
              <br />
              알아가볼까요?
            </StepTitle>
            <p className="text-caption-l text-text-tertiary">
              당신에 대해 더 알고 싶은 주제를 하나 선택해주세요. <br />
              선택한 주제에 맞춰, 나답이 질문들을 준비할게요.
            </p>
          </div>
          <ul className="flex-1 my-padding-y-m grid grid-cols-2 gap-x-padding-x-m gap-y-padding-y-m min-h-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, i) => {
              return (
                <li
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((innerItem, idx) => {
                        if (idx === i) {
                          return {
                            ...innerItem,
                            isSelected: true,
                          };
                        } else {
                          return { ...innerItem, isSelected: false };
                        }
                      }),
                    );
                  }}
                  key={i}
                  className={clsx(
                    "py-padding-y-m px-padding-x-m flex flex-col items-start gap-gap-y-l border rounded-xl cursor-pointer",
                    {
                      "border-neutral-200": !item.isSelected,
                      "border-brand-primary bg-interactive-bg-hover":
                        item.isSelected,
                      "opacity-50":
                        !item.isSelected &&
                        items.some((item) => item.isSelected),
                    },
                  )}
                >
                  <QuestionBadge category={item.code} height={36.4} />
                  <p className="text-text-primary text-body-2">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
        <BlockButton
          disabled={!selectedItem}
          isLoading={categoryMutation.isPending}
          onClick={() => {
            categoryMutation.mutate({ interestCode: selectedItem!.code });
          }}
        >
          다음
        </BlockButton>
      </div>
    </div>
  );
}
