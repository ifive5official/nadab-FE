import clsx from "clsx";
import InlineButton from "./InlineButton";
import { useQuery } from "@tanstack/react-query";
import { feedShareStatusOptions } from "@/features/social/queries";
import { useShareFeedMutation } from "@/features/social/hooks/useShareFeedMutation";
import { useUnshareFeedMutation } from "@/features/social/hooks/useUnshareFeedMutation";
import Toast from "./Toast";
import { useState } from "react";
import { WarningFilledIcon } from "./Icons";
import useModalStore from "@/store/modalStore";

type SharedBannerConfig = {
  bannerText1: string;
  bannerText2: string;
  btnText: string;
  isBtnDisabled?: boolean;
  onButtonClick?: () => void;
};

type Props = {
  className?: string;
};

// 오늘의 기록 공유 배너
export default function ShareBanner({ className }: Props) {
  const { showModal, closeModal } = useModalStore();

  const { data, isError, isLoading } = useQuery(feedShareStatusOptions);
  const shareFeedMutation = useShareFeedMutation({
    onSuccess: () => setToastMessage("오늘의 기록을 친구와 공유했어요."),
  });
  const unShareFeedMutation = useUnshareFeedMutation({
    onSuccess: () => setToastMessage("오늘의 기록 공유를 중단했어요."),
  });

  const [toastMessage, setToastMessage] = useState<string>("");

  const isShared = data?.isShared;
  const sharedStatus = isError ? "ERROR" : isShared ? "SHARED" : "NOT_SHARED";

  const configMap: Record<
    "ERROR" | "SHARED" | "NOT_SHARED",
    SharedBannerConfig
  > = {
    ERROR: {
      bannerText1: "오늘의 질문에 답하고",
      bannerText2: "친구들과 공유해보세요.",
      btnText: "공유하기",
      isBtnDisabled: true,
    },
    SHARED: {
      bannerText1: "오늘 내가 쓴 기록을",
      bannerText2: "친구들과 공유했어요.",
      btnText: "공유 멈추기",
      onButtonClick: () => {
        showModal({
          icon: WarningFilledIcon,
          title: "오늘의 기록 공유를 중단하시겠어요?",
          children: "내 기록이 친구의 피드에서 사라져요.",
          buttons: [
            {
              label: "취소",
              onClick: closeModal,
            },
            {
              label: "확인",
              onClick: () => {
                closeModal();
                unShareFeedMutation.mutate();
              },
            },
          ],
        });
      },
    },
    NOT_SHARED: {
      bannerText1: "오늘 내가 쓴 기록을",
      bannerText2: "친구들과 공유해볼까요?",
      btnText: "공유하기",
      onButtonClick: () => {
        shareFeedMutation.mutate();
      },
    },
  };

  // 에러 방지용 기본값
  const shareBannerConfig = configMap[sharedStatus] || configMap.ERROR;
  return (
    <>
      <div
        className={clsx(
          "rounded-lg px-padding-x-m py-padding-y-m flex items-center justify-between",
          sharedStatus === "ERROR"
            ? "bg-surface-layer-1"
            : "bg-brand-primary-alpha-10",
          className,
        )}
      >
        <div className={clsx("flex flex-col", isLoading && "invisible")}>
          <span className="text-label-m">{shareBannerConfig.bannerText1}</span>
          <span className="text-title-3">{shareBannerConfig.bannerText2}</span>
        </div>
        <InlineButton
          variant="tertiary"
          isLoading={
            shareFeedMutation.isPending || unShareFeedMutation.isPending
          }
          disabled={shareBannerConfig.isBtnDisabled}
          onClick={shareBannerConfig.onButtonClick}
          className={clsx(isLoading && "invisible")}
        >
          {shareBannerConfig.btnText}
        </InlineButton>
      </div>
      <Toast
        isOpen={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </>
  );
}
