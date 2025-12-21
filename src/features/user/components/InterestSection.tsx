// 마이페이지 관심주제 섹션
import { Section } from "@/features/user/components/AccountSectionComponents";
import clsx from "clsx";
import initialCategories from "@/constants/categories";
import type { CurrentUser } from "@/types/currentUser";

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
      <ul className="flex flex-wrap gap-gap-x-s py-padding-y-xs">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <li
              key={category.title}
              className={clsx(
                "flex items-center gap-gap-x-xs text-label-m rounded-xl border border-button-tertiary-border-default px-2.5 py-[5px] bg-button-tertiary-bg-default cursor-pointer",
                category.isSelected
                  ? "text-button-tertiary-text-default"
                  : "text-button-disabled-text"
              )}
              onClick={() => {
                if (!isPending) {
                  onSelectInterest(category.code);
                }
              }}
            >
              <Icon
                fill={
                  category.isSelected
                    ? "var(--color-icon-primary)"
                    : "var(--color-icon-disabled)"
                }
              />
              <p>{category.title}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
