import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { crystalsOptions, currentUserOptions } from "../user/quries";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import categories from "@/constants/categories";
import { InfoButton } from "./ReportComponents";
import { Badge, CrystalBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import useTypeReport from "./hooks/useTypeReport";
import { useGenerateTypeReportMutation } from "./hooks/useGenerateTypeReportMutation";
import { useDeleteTypeReportMutation } from "./hooks/useDeleteTypeReportMutation";
import useModalStore from "@/store/modalStore";
import { WarningFilledIcon } from "@/components/Icons";
import useToastStore from "@/store/toastStore";
import { hasLastConsonant } from "@/lib/hasLastConsonant";
type Props = {
  category: (typeof categories)[number]["code"];
};

export default function TypeReportTab({ category }: Props) {
  const { data: crystalData } = useQuery(crystalsOptions);
  const crystalBalance = crystalData?.crystalBalance ?? 0;
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const { reports: typeReports } = useTypeReport();
  const generateTypeReportMutation = useGenerateTypeReportMutation({
    interestCode: category,
    onSuccess: () => {
      if (!typeReports![category].eligibility?.isFirstFree) {
        showToast({
          message: `100 크리스탈이 소진되었어요.`,
        });
      }
    },
  });
  const typeReport = typeReports![category].current;
  const isGenerating =
    typeReports![category].generation?.status === "IN_PROGRESS";

  const { showModal, closeModal } = useModalStore();
  const { showToast } = useToastStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const deleteTypeReportMutation = useDeleteTypeReportMutation({
    interestCode: category,
  });

  return (
    <>
      <button onClick={() => deleteTypeReportMutation.mutate()}>
        유형 리포트 삭제(테스트용)
      </button>
      <section className="relative flex-1 flex flex-col items-center">
        {typeReport && !isGenerating ? (
          // 유형 레포트
          <div className="w-full mt-padding-y-l flex flex-col">
            <div className="relative mb-margin-y-l">
              <div className="flex items-end">
                <p className="text-title-3 mr-auto">
                  {currentUser.nickname}님은
                  <br />
                  <span className="text-brand-primary">
                    {typeReport.analysisTypeName}
                  </span>
                  {hasLastConsonant(typeReport.analysisTypeName!)
                    ? "이에요."
                    : "예요."}
                </p>
                <InfoButton onClick={() => setIsPopoverOpen(true)} />
              </div>
              {isPopoverOpen && (
                <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
                  <Popover
                    isOpen={isPopoverOpen}
                    onClose={() => setIsPopoverOpen(false)}
                    className="dark:bg-surface-layer-2"
                  />
                </div>
              )}
            </div>
            <img src={typeReport.typeImageUrl} className="mx-margin-x-l" />
            <div className="flex gap-gap-x-s my-gap-y-l">
              <Badge size="m">{typeReport.hashTag1!}</Badge>
              <Badge size="m">{typeReport.hashTag2!}</Badge>
              <Badge size="m">{typeReport.hashTag3!}</Badge>
            </div>
            <p className="text-body-2 text-text-secondary">
              {typeReport.typeAnalysis}
            </p>
            <div className="my-gap-y-xl flex flex-col gap-gap-y-l">
              <div className="rounded-2xl px-padding-x-m py-padding-y-m bg-field-bg-hover border border-border-base flex flex-col gap-padding-y-xs">
                <p className="text-interactive-text-default text-label-l">
                  {typeReport.personaTitle1}
                </p>
                <p className="text-text-secondary text-body-2">
                  {typeReport.personaContent1}
                </p>
              </div>
              <div className="rounded-2xl px-padding-x-m py-padding-y-m bg-field-bg-hover border border-border-base flex flex-col gap-padding-y-xs">
                <p className="text-interactive-text-default text-label-l">
                  {typeReport.personaTitle2}
                </p>
                <p className="text-text-secondary text-body-2">
                  {typeReport.personaContent2}
                </p>
              </div>
            </div>
            <BlockButton
              isLoading={isGenerating || generateTypeReportMutation.isPending}
              variant={crystalBalance >= 100 ? "primary" : "disabled"}
              onClick={() => {
                if (crystalBalance >= 100) {
                  generateTypeReportMutation.mutate();
                } else {
                  showModal({
                    icon: WarningFilledIcon,
                    title: "현재 보유한\n크리스탈이 부족해요.",
                    children: (
                      <p className="flex items-center gap-gap-x-s">
                        <span className="text-caption-m">
                          남은 크리스탈 개수
                        </span>
                        <CrystalBadge crystals={100 - crystalBalance} />
                      </p>
                    ),
                    buttons: [{ label: "확인", onClick: closeModal }],
                  });
                }
              }}
            >
              100 크리스탈로 리포트 새로 받기
            </BlockButton>
          </div>
        ) : (
          // 레포트 없을 때
          <>
            <div className="w-full flex-1 flex flex-col gap-gap-y-m px-padding-x-m py-padding-y-xl mt-gap-y-l mb-margin-y-xxl rounded-2xl shadow-1 bg-[url(/type-report-bg.png)] dark:bg-[url(/type-report-bg-dark.png)] bg-cover">
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
                  ? "유형 리포트를 생성 중이에요."
                  : "유형 리포트를 받아볼까요?"}
              </p>
              <p className="text-caption-l">
                {isGenerating ? (
                  "리포트 생성에 1~2분 정도 걸릴 수 있어요."
                ) : (
                  <>
                    집, 학교, 직장에서의 나는 모두 달라요.
                    <br />
                    주제별 유형 리포트로 다양한 영역에서 나의 유형을
                    확인해보세요.
                  </>
                )}
              </p>
              <BlockButton
                className="mt-auto"
                isLoading={isGenerating || generateTypeReportMutation.isPending}
                variant={
                  typeReports![category].eligibility?.canGenerate
                    ? "primary"
                    : "disabled"
                }
                onClick={() => generateTypeReportMutation.mutate()}
              >
                {typeReports![category].eligibility?.isFirstFree
                  ? "무료로 리포트 받기"
                  : "100 크리스탈로 리포트 새로 받기"}
              </BlockButton>
            </div>
          </>
        )}
      </section>
    </>
  );
}
