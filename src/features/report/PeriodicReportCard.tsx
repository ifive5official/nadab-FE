// 주간/월간 레포트 탭에서 보여지는 섹션
import { Badge, CrystalBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import type { components } from "@/generated/api-types";
import { REPORT_CONFIGS } from "./reportConfigs";
import { InfoButton } from "./ReportComponents";
import { useNavigate } from "@tanstack/react-router";
import useModalStore from "@/store/modalStore";
import { WarningFilledIcon } from "@/components/Icons";

type ReportRes = components["schemas"]["WeeklyReportResponse"];

type Props = {
  reportType: "weekly" | "monthly";
  report: ReportRes | undefined;
  prevReport: ReportRes | undefined;
  onGenerate: () => void;
  crystalBalance: number;
  isGenerating: boolean; // 생성중 로딩 화면을 보이기 위함
};

export default function PeriodicReportCard({
  reportType,
  report,
  prevReport,
  onGenerate,
  crystalBalance,
  isGenerating,
}: Props) {
  const reportConfig = REPORT_CONFIGS[reportType];
  const REPORT_STATUS = {
    NONE: {
      title: `지난${reportConfig.periodText} 리포트를 받아볼까요?`,
      content: `지난${reportConfig.periodText}에 답변을 ${reportConfig.requiredAnswers}건 이상 작성했다면 리포트를 생성할 수 있어요. 지난${reportConfig.periodText} 리포트로 나를 되돌아보세요.`,
      btnText: `${reportConfig.cost} 크리스탈로 받기`,
      btnVariant: crystalBalance >= reportConfig.cost ? "primary" : "disabled",
      handleBtnClick: () => {
        if (crystalBalance >= reportConfig.cost) {
          onGenerate();
        } else {
          showModal({
            icon: WarningFilledIcon,
            title: "현재 보유한\n크리스탈이 부족해요.",
            children: (
              <p className="flex items-center gap-gap-x-s">
                <span className="text-caption-m">남은 크리스탈 개수</span>
                <CrystalBadge crystals={reportConfig.cost - crystalBalance} />
              </p>
            ),
            buttons: [{ label: "확인", onClick: closeModal }],
          });
        }
      },
    },
    GENERATING: {
      title: `지난${reportConfig.periodText} 리포트를 생성 중이에요.`,
      content: `리포트 생성에 1-2분 정도 걸릴 수 있어요.\n조금만 기다려주세요.`,
      btnText: "리포트 생성 중",
      btnVariant: "disabled",
      handleBtnClick: undefined,
    },
    READY: {
      title: `지난${reportConfig.periodText} 리포트가 생성되었어요.`,
      content: `지난${reportConfig.periodText} 기록에서 발견된 점들과\n보완점을 확인해보세요.`,
      btnText: "리포트 보기",
      btnVariant: "primary",
      handleBtnClick: () => navigate({ to: `/report/${reportType}/current` }),
    },
  } as const;
  const reportState =
    report && !isGenerating ? "READY" : isGenerating ? "GENERATING" : "NONE";
  const statusConfig = REPORT_STATUS[reportState];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { showModal, closeModal, showError } = useModalStore();

  const navigate = useNavigate();

  return (
    <section
      className={
        "px-margin-x-l py-margin-y-xl bg-surface-layer-1 rounded-2xl shadow-2"
      }
    >
      <div className={"flex flex-col gap-margin-y-m mb-padding-y-xxl"}>
        <div className="relative flex justify-between items-center">
          <Badge>{reportConfig.label}</Badge>
          <InfoButton onClick={() => setIsPopoverOpen(true)} />
          <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>
        </div>
        <h3 className="text-title-2">{statusConfig.title}</h3>
        <p className="text-caption-l whitespace-pre-line">
          {statusConfig.content}
        </p>
      </div>
      <div className="flex gap-gap-x-xs">
        <BlockButton
          onClick={() => {
            if (prevReport) {
              navigate({ to: `/report/${reportType}/previous` });
            } else {
              showError("이전 리포트가\n존재하지 않아요.");
            }
          }}
          variant={prevReport ? "secondary" : "disabled"}
        >
          이전 리포트 보기
        </BlockButton>
        <BlockButton
          variant={statusConfig.btnVariant}
          onClick={statusConfig.handleBtnClick}
        >
          {statusConfig.btnText}
        </BlockButton>
      </div>
    </section>
  );
}
