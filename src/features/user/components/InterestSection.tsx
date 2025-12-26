// 마이페이지 관심주제 섹션
import { Section } from "@/features/user/components/AccountSectionComponents";
import initialCategories from "@/constants/categories";
import type { CurrentUser } from "@/types/currentUser";
import { QuestionBadge } from "@/components/Badges";

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
  const categories = initialCategories.map((category) => ({
    ...category,
    isSelected: category.code === currentUser?.interestCode ? true : false,
  }));

  return (
    <Section title="관심 주제">
      <div className="grid grid-cols-3 gap-gap-x-s py-padding-y-xs">
        {categories.map((category) => {
          return (
            <QuestionBadge
              key={category.title}
              height={36}
              category={category.title}
              onClick={() => {
                if (!isPending) {
                  onSelectInterest(category.code);
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
