import { createFileRoute, useNavigate } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import {
  BarChartSquareFilledIcon,
  CoffeeFilledIcon,
  HappyFilledIcon,
  UsersFilledIcon,
} from "@/components/Icons";
import StepTitle from "@/features/auth/StepTitle";
import clsx from "clsx";
import { useState, useEffect } from "react";
import useSignupStore from "@/store/signupStore";
import { getNextStepPath } from "@/features/auth/signupSteps";

export const Route = createFileRoute("/(auth)/onboarding/category")({
  component: Category,
  // beforeLoad: () => {
  //   // 이전 단계 건너뛰는 것 방지
  //   const { hasSeenIntro } = useSignupStore.getState();
  //   if (!hasSeenIntro) {
  //     throw redirect({ to: "/signup/terms" });
  //   }
  // },
});

function Category() {
  const updateCategory = useSignupStore.use.updateCategory();
  const initialItems = [
    {
      icon: <BarChartSquareFilledIcon />,
      title: "일과 성장",
      isSelected: false,
    },
    {
      icon: <HappyFilledIcon />,
      title: "내면 탐색",
      isSelected: false,
    },
    {
      icon: <CoffeeFilledIcon />,
      title: "일상의 균형",
      isSelected: false,
    },
    {
      icon: <UsersFilledIcon />,
      title: "사람과 관계",
      isSelected: false,
    },
  ];
  const [items, setItems] = useState(initialItems);
  const selectedItem = items.find((item) => item.isSelected);
  const navigate = useNavigate();

  useEffect(() => {
    const { hasSeenIntro } = useSignupStore.getState();
    if (!hasSeenIntro) {
      navigate({ to: "/signup/terms", replace: true });
    }
  }, [navigate]);

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
                {item.icon}{" "}
                <p className="text-title-3 text-text-primary">{item.title}</p>
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
          // 모바일 freeze 이슈때문에 넣음
          // 더 나은 해결방법 나올 때까지 지우지 말 것
          Promise.resolve().then(() => {
            navigate({ to: nextStep });
          });
        }}
      >
        다음
      </BlockButton>
    </div>
  );
}
