import { WarningFilledIcon } from "@/components/Icons";
import { CrystalBadge } from "@/components/Badges";
import { crystalsOptions } from "@/features/user/queries";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import { useQuery } from "@tanstack/react-query";
import { useChargeAskChatTurnsMutation } from "./useChargeAskChatTurnsMutation";

// 대화권 부족 안내부터 크리스탈 결제 및 성공 피드백까지 한 흐름으로 처리합니다.
export function useAskChatTurnChargeFlow() {
  const { showModal, closeModal } = useModalStore();
  const { showToast } = useToastStore();
  const { data: crystalData } = useQuery(crystalsOptions);
  const chargeMutation = useChargeAskChatTurnsMutation({
    onSuccess: () => {
      showToast({
        message: "대화권 10회가 충전되었어요.",
        bottom: "bottom-[var(--ask-toast-bottom)]",
        variant: "success",
      });
    },
  });

  const requestCharge = ({ previewOnly = false } = {}) => {
    if (chargeMutation.isPending) return;

    showModal({
      icon: WarningFilledIcon,
      title: "메시지 충전이 필요해요.",
      showCloseButton: true,
      children: (
        <div className="flex flex-col items-center gap-gap-y-m text-center">
          <p className="whitespace-pre-line">
            200 크리스탈로 10번의 대화를 나눌 수 있어요.{"\n"}
            대화를 이어가고 싶다면 메시지를 충전해주세요.
          </p>
          <div className="flex items-center gap-gap-x-xs">
            <span>남은 크리스탈 개수</span>
            <CrystalBadge crystals={crystalData?.crystalBalance ?? 0} />
          </div>
        </div>
      ),
      buttons: [
        {
          label: "200 크리스탈로 충전하기",
          onClick: () => {
            closeModal();
            if (previewOnly) {
              showToast({
                message: "디버그 모드에서는 실제로 충전되지 않아요.",
                bottom: "bottom-[var(--ask-toast-bottom)]",
              });
              return;
            }
            chargeMutation.mutate();
          },
        },
      ],
    });
  };

  return {
    requestCharge,
    isCharging: chargeMutation.isPending,
  };
}
