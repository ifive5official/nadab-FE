import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import categories from "@/constants/categories";
import StepTitle from "@/features/auth/StepTitle";
import clsx from "clsx";
import { useState } from "react";
import useSignupStore from "@/store/signupStore";
import { getNextStepPath } from "@/features/auth/signupSteps";
import { CategoryCircleCheckFilledIcon } from "@/components/Icons";

export const Route = createFileRoute("/(auth)/onboarding/category")({
  component: Category,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { hasSeenIntro } = useSignupStore.getState();
    if (!hasSeenIntro) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

function Category() {
  const updateCategory = useSignupStore.use.updateCategory();
  const [items, setItems] = useState(
    categories.map((category) => ({ ...category, isSelected: false }))
  );
  const selectedItem = items.find((item) => item.isSelected);
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-gap-y-l">
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
        <ul className="py-padding-y-m flex flex-col gap-padding-y-m">
          {items.map((item, i) => {
            const Icon = item.icon;
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
                    })
                  );
                }}
                key={i}
                className={clsx(
                  "py-padding-y-xl px-padding-x-xl flex items-center gap-gap-x-l border rounded-xl cursor-pointer",
                  {
                    "border-neutral-200 hover:bg-interactive-bg-hover hover:border-interactive-border-hover":
                      !item.isSelected,
                    "border-brand-primary bg-interactive-bg-muted":
                      item.isSelected,
                  }
                )}
              >
                <Icon />{" "}
                <p className="text-title-3 text-text-primary mr-auto">
                  {item.title}
                </p>
                {item.isSelected && <CategoryCircleCheckFilledIcon />}
              </li>
            );
          })}
        </ul>
      </div>
      <BlockButton
        disabled={!selectedItem}
        onClick={() => {
          updateCategory(selectedItem!.title);
          const nextStep = getNextStepPath("category");
          navigate({ to: nextStep });
        }}
      >
        다음
      </BlockButton>
    </div>
  );
}
