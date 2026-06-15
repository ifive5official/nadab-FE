// 마이페이지 관심주제 섹션
import { Section } from "@/features/user/components/AccountSectionComponents";
import initialCategories from "@/constants/categories";
import type { CurrentUser } from "@/types/currentUser";
import { QuestionBadge } from "@/components/Badges";
import { useQuery } from "@tanstack/react-query";
import { questionOptions } from "@/features/question/queries";
import useModalStore from "@/store/modalStore";

type Props = {
  currentUser: CurrentUser;
  onSelectInterest: (interestCode: string) => void;
  isPending: boolean;
};

export default function InterestSection({
  currentUser,
  onSelectInterest,
  isPending,
}: Props) {
  const { data: question } = useQuery(questionOptions);
  const canRerollQuestion =
    !question?.answered && (question?.rerollRemainingCount ?? 0) > 0;
  const { showModal, closeModal, showError } = useModalStore();

  const categories = initialCategories.map((category) => ({
    ...category,
    isSelected: category.code === currentUser?.interestCode ? true : false,
  }));

  return (
    <Section title="선택 주제">
      <div className="grid grid-cols-3 gap-gap-x-s py-padding-y-xs">
        {categories.map((category) => {
          return (
            <QuestionBadge
              key={category.title}
              height={36}
              category={category.code}
              onClick={() => {
                if (!category.isSelected && !isPending) {
                  if (canRerollQuestion) {
                    showModal({
                      icon: () => (
                        <img
                          src="/mainLogo.png"
                          alt="모달 아이콘"
                          className="aspect-square h-[33px] p-[11px] box-content"
                        />
                      ),
                      title: "선택 주제를 변경할까요?",
                      children:
                        "확인 시 새로운 선택 주제와 함께 다른 질문으로 변경돼요.",
                      buttons: [
                        {
                          label: "취소",
                          onClick: closeModal,
                        },
                        {
                          label: "확인",
                          onClick: () => {
                            onSelectInterest(category.code);
                            closeModal();
                          },
                        },
                      ],
                    });
                  } else {
                    showError("새로고침 횟수가 부족해요.");
                  }
                }
              }}
              isActive={category.isSelected}
              className="cursor-pointer"
            />
          );
        })}
      </div>
    </Section>
  );
}
