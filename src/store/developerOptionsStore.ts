import { create } from "zustand";
import { persist } from "zustand/middleware";
import createSelectors from "./createSelectors";

type DeveloperOptionsState = {
  isUpdateNoticeOutdatedQaEnabled: boolean;
  toggleUpdateNoticeOutdatedQa: () => void;
  isReportHistoryEmptyQaEnabled: boolean;
  toggleReportHistoryEmptyQa: () => void;
};

const useDeveloperOptionsStoreBase = create<DeveloperOptionsState>()(
  persist(
    (set) => ({
      isUpdateNoticeOutdatedQaEnabled: false,
      toggleUpdateNoticeOutdatedQa: () =>
        set((state) => ({
          isUpdateNoticeOutdatedQaEnabled:
            !state.isUpdateNoticeOutdatedQaEnabled,
        })),
      isReportHistoryEmptyQaEnabled: false,
      toggleReportHistoryEmptyQa: () =>
        set((state) => ({
          isReportHistoryEmptyQaEnabled:
            !state.isReportHistoryEmptyQaEnabled,
        })),
    }),
    {
      name: "developer-options-storage",
    },
  ),
);

const useDeveloperOptionsStore = createSelectors(useDeveloperOptionsStoreBase);

export default useDeveloperOptionsStore;
