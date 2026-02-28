import clsx from "clsx";
import InlineButton from "./InlineButton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { feedShareStatusOptions } from "@/features/social/queries";
import { useShareFeedMutation } from "@/features/social/hooks/useShareFeedMutation";
import { useUnshareFeedMutation } from "@/features/social/hooks/useUnshareFeedMutation";
import { ShareIcon, StopIcon, WarningFilledIcon } from "./Icons";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";

type SharedBannerConfig = {
  bannerText1: string;
  bannerText2: string;
  btnText: React.ReactNode;
  isBtnDisabled?: boolean;
  onButtonClick?: () => void;
  bannerColor: string;
  btnClass: string;
};

type Props = {
  type?: "closable" | "fixed";
  className?: string;
};

// 오늘의 기록 공유 배너
export default function ShareBanner({ type = "fixed", className }: Props) {
  const { showModal, closeModal } = useModalStore();
  const { showToast } = useToastStore();

  const { data } = useSuspenseQuery(feedShareStatusOptions);
  const shareFeedMutation = useShareFeedMutation({
    onSuccess: () => showToast({ message: "오늘의 기록을 친구와 공유했어요." }),
  });
  const unShareFeedMutation = useUnshareFeedMutation({
    onSuccess: () => showToast({ message: "오늘의 기록 공유를 중단했어요." }),
  });

  const isShared = data?.isShared;
  const sharedStatus =
    isShared === undefined
      ? "NOT_ANSWERED"
      : isShared
        ? "SHARED"
        : "NOT_SHARED";

  const configMap: Record<
    "NOT_ANSWERED" | "SHARED" | "NOT_SHARED",
    SharedBannerConfig
  > = {
    NOT_ANSWERED: {
      bannerText1: "오늘의 질문에 답하고",
      bannerText2: "친구들과 공유해보세요.",
      btnText: (
        <>
          <ShareIcon />
          <span> 공유하기</span>
        </>
      ),
      isBtnDisabled: true,
      bannerColor: "bg-surface-layer-1",
      btnClass: "",
    },
    SHARED: {
      bannerText1: "오늘 내가 쓴 기록을",
      bannerText2: "친구들과 공유했어요.",
      btnText: (
        <>
          <StopIcon />
          <span> 공유 멈추기</span>
        </>
      ),
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
      bannerColor: "bg-[#E8F8F3] dark:bg-[#1A404A]",
      btnClass: "text-[#52C19E]! border-[#52C19E]!",
    },
    NOT_SHARED: {
      bannerText1: "오늘 내가 쓴 기록을",
      bannerText2: "친구들과 공유해볼까요?",
      btnText: (
        <>
          <ShareIcon />
          <span> 공유하기</span>
        </>
      ),
      onButtonClick: () => {
        shareFeedMutation.mutate();
      },
      bannerColor: "bg-brand-primary-alpha-10",
      btnClass: "text-brand-primary! border-brand-primary!",
    },
  };

  // 에러 방지용 기본값
  const shareBannerConfig = configMap[sharedStatus];
  return (
    <>
      <div
        className={clsx(
          "rounded-lg px-padding-x-m py-padding-y-m flex items-center justify-between",
          shareBannerConfig.bannerColor,
          className,
        )}
      >
        <div className="flex flex-col">
          <span className="text-label-m">{shareBannerConfig.bannerText1}</span>
          <span className="text-title-3">{shareBannerConfig.bannerText2}</span>
        </div>
        <InlineButton
          className={shareBannerConfig.btnClass}
          variant="tertiary"
          isLoading={
            shareFeedMutation.isPending || unShareFeedMutation.isPending
          }
          disabled={shareBannerConfig.isBtnDisabled}
          onClick={shareBannerConfig.onButtonClick}
        >
          <span className="flex gap-gap-x-s items-center">
            {shareBannerConfig.btnText}
          </span>
        </InlineButton>
      </div>
    </>
  );
}
