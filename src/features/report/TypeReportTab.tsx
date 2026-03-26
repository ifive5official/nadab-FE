import { useState } from "react";
import { Popover } from "@/components/Popover";
import categories from "@/constants/categories";
import { InfoButton } from "./ReportComponents";
import { Badge, CrystalBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import useTypeReport from "./hooks/useTypeReport";
import { useGenerateTypeReportMutation } from "./hooks/useGenerateTypeReportMutation";
import { useDeleteTypeReportMutation } from "./hooks/useDeleteTypeReportMutation";
import { LoadingSpinnerIcon, WarningFilledIcon } from "@/components/Icons";
import useToastStore from "@/store/toastStore";
import clsx from "clsx";
import Seperator from "@/components/Seperator";
import TopNotification from "@/components/TopNotification";
import TypeReportSlides from "./TypeReportSlides";

export default function TypeReportTab() {
  const { reports: typeReports } = useTypeReport();

  const typesWithReport: (typeof categories)[number]["code"][] = [];
  const typesWithoutReport: (typeof categories)[number]["code"][] = [];

  Object.entries(typeReports!)?.forEach(([type, report]) => {
    if (report.current !== null) {
      typesWithReport.push(type as (typeof categories)[number]["code"]);
    } else {
      typesWithoutReport.push(type as (typeof categories)[number]["code"]);
    }
  });

  // 리포트가 있는 유형 우선 선택
  const [selectedCategory, setSelectedCategory] = useState(
    typesWithReport?.[0] ?? typesWithoutReport[0],
  );

  const selectedCategoryName = categories.find(
    (item) => item.code === selectedCategory,
  )!.title;

  const generateTypeReportMutation = useGenerateTypeReportMutation({
    interestCode: selectedCategory,
    onSuccess: () => {
      if (!typeReports![selectedCategory].eligibility?.isFirstFree) {
        showToast({
          message: `100 크리스탈이 소진되었어요.`,
        });
      }
    },
  });
  const typeReport = typeReports![selectedCategory];
  const isGenerating =
    typeReports![selectedCategory].generation?.status === "IN_PROGRESS";
  const isLoading = isGenerating || generateTypeReportMutation.isPending;

  const { showToast } = useToastStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isTopNotificationVisible = !typeReport.current && !isGenerating;

  const deleteTypeReportMutation = useDeleteTypeReportMutation({
    interestCode: selectedCategory,
  });

  return (
    <>
      <ul className="shrink-0 flex items-center gap-gap-x-s mb-margin-y-l overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[...typesWithReport, ...typesWithoutReport].map((type) => {
          const selected = type === selectedCategory;
          const categoryItem = categories.find((item) => item.code === type)!;
          return (
            <li
              onClick={() => setSelectedCategory(type)}
              key={type}
              className={clsx(
                "rounded-lg px-padding-x-m py-1.5 text-button-2 whitespace-pre border",
                selected
                  ? "bg-brand-primary border-brand-primary text-button-primary-text-default"
                  : "bg-surface-layer-1 border-button-tertiary-border-default text-interactive-text-hover",
              )}
            >
              {categoryItem.title}
            </li>
          );
        })}
      </ul>
      <Seperator />
      {isTopNotificationVisible && (
        <TopNotification
          className="mt-gap-y-m"
          typeName={selectedCategoryName}
          canGenerate={typeReport.eligibility?.canGenerate ?? false}
          dailyCompletedCount={typeReport.eligibility?.dailyCompletedCount ?? 0}
          requiredCount={typeReport.eligibility?.requiredCount ?? 0}
        />
      )}
      {/* {!import.meta.env.VITE_IS_PRODUCTION && (
        <button onClick={() => deleteTypeReportMutation.mutate()}>
          유형 리포트 삭제(테스트용)
        </button>
      )} */}
      <section className="relative flex-1 flex flex-col items-center">
        {typeReport.current && !isGenerating ? (
          // 유형 레포트
          <TypeReportSlides
            typeName={selectedCategoryName}
            typeReport={typeReport.current}
            isPopoverOpen={isPopoverOpen}
            handlePopoverOpen={() => setIsPopoverOpen(true)}
            handlePooverClose={() => setIsPopoverOpen(false)}
          />
        ) : (
          // 레포트 표지(?)
          <>
            <div
              className={clsx(
                "relative w-full h-full px-padding-x-m py-padding-y-xl rounded-2xl shadow-1 bg-[url(/type-report-bg.png)] dark:bg-[url(/type-report-bg-dark.png)] bg-cover",
                isTopNotificationVisible ? "mt-margin-y-s" : "mt-margin-y-l",
              )}
            >
              {isGenerating && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/30" />
              )}
              <div className="relative h-full flex flex-col gap-gap-y-m">
                <div className="relative flex justify-between items-center">
                  <Badge>유형 리포트</Badge>
                  <InfoButton onClick={() => setIsPopoverOpen(true)} />
                  <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
                    <Popover
                      isOpen={isPopoverOpen}
                      onClose={() => setIsPopoverOpen(false)}
                    />
                  </div>
                </div>
                <p className="text-title-2">
                  {isGenerating
                    ? `나만의 ${selectedCategoryName} 리포트를 생성 중이에요.`
                    : `나만의 ${selectedCategoryName} 리포트를 확인해보세요.`}
                </p>
                <p className="text-caption-l">
                  {isGenerating ? (
                    "리포트 생성에 2~3분 정도 걸릴 수 있어요."
                  ) : (
                    <>
                      집, 학교, 직장에서의 나는 모두 달라요.
                      <br />
                      주제별 유형 리포트로 다양한 영역에서의 나에 대해
                      알아보세요.
                    </>
                  )}
                </p>
                {isGenerating && (
                  <LoadingSpinnerIcon className="mx-auto my-auto" />
                )}
                <BlockButton
                  className="mt-auto"
                  disabled={isLoading}
                  variant={
                    typeReport.eligibility?.canGenerate ? "primary" : "disabled"
                  }
                  onClick={() => generateTypeReportMutation.mutate()}
                >
                  {isGenerating
                    ? "리포트 생성 중"
                    : typeReport.eligibility?.isFirstFree
                      ? "무료로 리포트 받기"
                      : "100 크리스탈로 리포트 새로 받기"}
                </BlockButton>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
