import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Badge, CrystalBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { Popover } from "@/components/Popover";
import { WarningFilledIcon } from "@/components/Icons";
import type { components } from "@/generated/api-types";
import useModalStore from "@/store/modalStore";
import { REPORT_CONFIGS } from "./reportConfigs";
import { InfoButton } from "./ReportComponents";

type MonthlyReportLocator =
  components["schemas"]["MonthlyReportLocatorResponse"];

type Props = {
  report: MonthlyReportLocator | undefined;
  onGenerate: () => void;
  crystalBalance: number;
  isGenerating: boolean;
};

export default function MonthlyReportV2Card({
  report,
  onGenerate,
  crystalBalance,
  isGenerating,
}: Props) {
  const reportConfig = REPORT_CONFIGS.monthly;
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { showModal, closeModal, showError } = useModalStore();

  const goToReport = (locator: MonthlyReportLocator | undefined) => {
    if (!locator) {
      showError("리포트를 불러올 수 없어요.");
      return;
    }

    const version = String(locator.version);

    if (version === "1") {
      navigate({
        to: "/report/$reportType/$period",
        params: { reportType: "monthly", period: "current" },
      });
      return;
    }

    if (version === "2") {
      navigate({
        to: "/report/monthly-v2/$period",
        params: { period: "current" },
      });
      return;
    }

    showError("리포트 버전을 확인할 수 없어요.");
  };

  const handleGenerateClick = () => {
    if (crystalBalance >= reportConfig.cost) {
      onGenerate();
      return;
    }

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
  };

  const reportState =
    report?.status === "COMPLETED"
      ? "READY"
      : isGenerating
        ? "GENERATING"
        : "NONE";

  const statusConfig = {
    NONE: {
      title: "지난달 리포트를 받아볼까요?",
      content:
        "지난달에 답변을 15건 이상 작성했다면 새로운 월간 리포트를 생성할 수 있어요.",
      btnText: `${reportConfig.cost} 크리스탈로 받기`,
      btnVariant: crystalBalance >= reportConfig.cost ? "primary" : "disabled",
      handleBtnClick: handleGenerateClick,
    },
    GENERATING: {
      title: "지난달 리포트를 생성 중이에요.",
      content: "리포트 생성에 1-2분 정도 걸릴 수 있어요.\n조금만 기다려주세요.",
      btnText: "리포트 생성 중",
      btnVariant: "disabled",
      handleBtnClick: undefined,
    },
    READY: {
      title: "지난달 리포트를 확인해보세요.",
      content: "지난달 기록에서 발견된 흐름과 감정, 관심사를 확인해보세요.",
      btnText: "리포트 보기",
      btnVariant: "primary",
      handleBtnClick: () => goToReport(report),
    },
  } as const;

  const currentConfig = statusConfig[reportState];

  return (
    <section className="px-margin-x-l py-margin-y-xl bg-surface-layer-1 rounded-2xl shadow-2">
      <div className="flex flex-col gap-margin-y-m mb-padding-y-xxl">
        <div className="relative flex justify-between items-center">
          <Badge>월간 리포트 v2</Badge>
          <InfoButton onClick={() => setIsPopoverOpen(true)} />
          <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>
        </div>
        <h3 className="text-title-2">{currentConfig.title}</h3>
        <p className="text-caption-l whitespace-pre-line">
          {currentConfig.content}
        </p>
      </div>
      <div>
        <BlockButton
          variant={currentConfig.btnVariant}
          onClick={currentConfig.handleBtnClick}
        >
          {currentConfig.btnText}
        </BlockButton>
      </div>
    </section>
  );
}
