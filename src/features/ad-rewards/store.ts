import { createAdRewardSession, getAdRewardQuote, getAdRewardSessionStatus } from "./api";
import { createAdRewardFlow } from "./flow";
import { initializeRewardAds, showRewardAd } from "./native";

export const adRewardFlow = createAdRewardFlow({
  quote: getAdRewardQuote,
  create: createAdRewardSession,
  status: getAdRewardSessionStatus,
  initialize: initializeRewardAds,
  show: showRewardAd,
});
