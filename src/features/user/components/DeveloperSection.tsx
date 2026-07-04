import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { AppIcon } from "@/components/AppIcon";
import { ChevronRightIcon } from "@/components/Icons";
import Switch from "@/components/Switch";
import { HOME_COACH_MARK_TOUR_ID } from "@/features/home/coach-mark/constants";
import { UPDATE_NOTICE_SHOWN_SESSION_KEY } from "@/features/home/useHomeEntryPrompts";
import {
  useDeleteMonthlyReportMutation,
  useDeleteWeeklyReportMutation,
} from "@/features/report/hooks/useDeleteWeeklyReportMutation";
import {
  clearMonthlyReportFixtureScenario,
  getMonthlyReportFixtureScenario,
  monthlyReportFixtureScenarioOptions,
  setMonthlyReportFixtureScenario,
  type MonthlyReportFixtureScenario,
} from "@/features/report/monthlyReportFixtures";
import useBottomModalStore from "@/store/bottomModalStore";
import { getCoachMarkCompletedKey } from "@/store/coachMarkTourStore";
import useDeveloperOptionsStore from "@/store/developerOptionsStore";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import { Section, SectionItem } from "./AccountSectionComponents";

function DeveloperModalIcon() {
  return <AppIcon name="tools-filled" color="primary" size={24} />;
}

export default function DeveloperSection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const { showModal, closeModal } = useModalStore();
  const { showBottomModal, closeBottomModal } = useBottomModalStore();
  const [monthlyReportFixtureScenario, setMonthlyReportFixtureScenarioState] =
    useState<MonthlyReportFixtureScenario | null>(() =>
      getMonthlyReportFixtureScenario(),
    );
  const {
    isUpdateNoticeOutdatedQaEnabled,
    toggleUpdateNoticeOutdatedQa,
  } = useDeveloperOptionsStore();
  const deleteWeeklyReportMutation = useDeleteWeeklyReportMutation();
  const deleteMonthlyReportMutation = useDeleteMonthlyReportMutation();

  const restartCoachMark = () => {
    window.localStorage.removeItem(
      getCoachMarkCompletedKey(HOME_COACH_MARK_TOUR_ID),
    );
    showToast({ message: "코치마크 완료 기록을 초기화했어요." });
    navigate({ to: "/" });
  };

  const invalidateMonthlyReportFixtureQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["currentUser", "monthly-report-v2"],
    });
    queryClient.invalidateQueries({
      queryKey: ["currentUser", "monthly-report-v1"],
    });
  };

  const toggleMonthlyReportFixture = () => {
    if (monthlyReportFixtureScenario) {
      clearMonthlyReportFixtureScenario();
      setMonthlyReportFixtureScenarioState(null);
      invalidateMonthlyReportFixtureQueries();
      showToast({ message: "월간 리포트 테스트 모드를 껐어요." });
      return;
    }

    setMonthlyReportFixtureScenario("current-v2");
    setMonthlyReportFixtureScenarioState("current-v2");
    invalidateMonthlyReportFixtureQueries();
    showToast({ message: "월간 리포트 테스트 모드를 켰어요." });
  };

  const selectMonthlyReportFixtureScenario = (
    scenario: MonthlyReportFixtureScenario,
  ) => {
    setMonthlyReportFixtureScenario(scenario);
    setMonthlyReportFixtureScenarioState(scenario);
    invalidateMonthlyReportFixtureQueries();
    showToast({ message: "월간 리포트 테스트 케이스를 변경했어요." });
  };

  const goToReportTab = () => {
    navigate({ to: "/report" });
  };

  const resetUpdateNoticeSession = () => {
    window.sessionStorage.removeItem(UPDATE_NOTICE_SHOWN_SESSION_KEY);
    showToast({ message: "업데이트 알림 세션 기록을 초기화했어요." });
  };

  const deleteWeeklyReport = () => {
    deleteWeeklyReportMutation.mutate(undefined, {
      onSuccess: () => showToast({ message: "주간 리포트를 삭제했어요." }),
    });
  };

  const deleteMonthlyReport = () => {
    deleteMonthlyReportMutation.mutate(undefined, {
      onSuccess: () => showToast({ message: "월간 리포트를 삭제했어요." }),
    });
  };

  const showTestToast = () => {
    showToast({ message: "토스트 테스트 메시지예요." });
  };

  const showTestModal = () => {
    showModal({
      icon: DeveloperModalIcon,
      title: "중앙 모달 테스트",
      children: "개발자 섹션에서 띄운 테스트 모달이에요.",
      buttons: [{ label: "확인", onClick: closeModal }],
    });
  };

  const showTestBottomModal = () => {
    showBottomModal({
      title: "하단 모달 테스트",
      items: [
        {
          label: "일반 항목",
          type: "normal",
          onClick: closeBottomModal,
        },
        {
          label: "선택된 항목",
          type: "selected",
          onClick: closeBottomModal,
        },
        {
          label: "경고 항목",
          type: "warning",
          onClick: closeBottomModal,
        },
      ],
    });
  };

  return (
    <Section title="개발자">
      <SectionItem
        title="코치마크 재시작"
        onClick={restartCoachMark}
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem
        title="업데이트 알림 다시 보기"
        onClick={resetUpdateNoticeSession}
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem
        title="업데이트 구버전 QA 모드"
        rightElement={
          <Switch
            isOn={isUpdateNoticeOutdatedQaEnabled}
            onClick={toggleUpdateNoticeOutdatedQa}
          />
        }
      />
      <SectionItem
        title="월간 리포트 테스트 모드"
        rightElement={
          <Switch
            isOn={monthlyReportFixtureScenario !== null}
            onClick={toggleMonthlyReportFixture}
          />
        }
      />
      {monthlyReportFixtureScenario && (
        <div className="flex flex-col gap-gap-y-s py-padding-y-xs">
          <div className="grid grid-cols-2 gap-gap-x-xs gap-gap-y-xs">
            {monthlyReportFixtureScenarioOptions.map((option) => {
              const isSelected =
                monthlyReportFixtureScenario === option.value;
              return (
                <button
                  key={option.value}
                  className={clsx(
                    "rounded-lg border px-padding-x-s py-padding-y-xs text-caption-m",
                    isSelected
                      ? "border-brand-primary bg-interactive-bg-hover text-brand-primary"
                      : "border-border-base bg-surface-layer-1 text-text-secondary",
                  )}
                  onClick={() =>
                    selectMonthlyReportFixtureScenario(option.value)
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <button
            className="text-caption-l text-brand-primary py-padding-y-xs text-left"
            onClick={goToReportTab}
          >
            리포트 탭에서 확인하기
          </button>
        </div>
      )}
      <SectionItem
        title={
          deleteWeeklyReportMutation.isPending
            ? "주간 리포트 삭제 중"
            : "주간 리포트 삭제"
        }
        onClick={
          deleteWeeklyReportMutation.isPending ? undefined : deleteWeeklyReport
        }
        disabled={deleteWeeklyReportMutation.isPending}
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem
        title={
          deleteMonthlyReportMutation.isPending
            ? "월간 리포트 삭제 중"
            : "월간 리포트 삭제"
        }
        onClick={
          deleteMonthlyReportMutation.isPending
            ? undefined
            : deleteMonthlyReport
        }
        disabled={deleteMonthlyReportMutation.isPending}
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem
        title="토스트 테스트"
        onClick={showTestToast}
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem
        title="중앙 모달 테스트"
        onClick={showTestModal}
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem
        title="하단 모달 테스트"
        onClick={showTestBottomModal}
        rightElement={<ChevronRightIcon />}
      />
    </Section>
  );
}
