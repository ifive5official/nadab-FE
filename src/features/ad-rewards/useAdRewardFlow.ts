import { useEffect, useRef, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { askChatKeys } from "@/features/ask/queries";
import { adRewardFlow } from "./store";
import { isAdRewardAvailable } from "./native";
import type { AdRewardFeature } from "./types";

// 현재 화면의 요청을 보상 흐름에 연결하고 화면 이탈 시 자동 실행을 취소합니다.
export function useAdRewardFlow() {
  const owner = useRef(Symbol("ad-reward-owner"));
  const pathname = useLocation({ select: (location) => location.pathname });
  const queryClient = useQueryClient();
  const state = useSyncExternalStore(adRewardFlow.subscribe, adRewardFlow.getSnapshot);

  useEffect(() => {
    const currentOwner = owner.current;
    return () => adRewardFlow.cancel(currentOwner);
  }, [pathname]);

  // 광고 지원 여부와 재실행 상태를 확인하고 원래 요청을 한 번만 등록합니다.
  function requestReward(feature: AdRewardFeature, resume: () => Promise<unknown>) {
    if (!isAdRewardAvailable() || adRewardFlow.getSnapshot().phase === "resuming") return false;
    if (adRewardFlow.getSnapshot().phase !== "idle") return true;
    return adRewardFlow.start({
      owner: owner.current,
      feature,
      resume,
      refresh: () => Promise.all([
        queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] }),
        queryClient.invalidateQueries({ queryKey: askChatKeys.home() }),
      ]),
    });
  }

  return { requestReward, isRewardBusy: state.phase !== "idle" };
}
