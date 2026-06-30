import { create } from "zustand";
import { persist } from "zustand/middleware";
import createSelectors from "./createSelectors";

type DeveloperOptionsState = {
  isUpdateNoticeOutdatedQaEnabled: boolean;
  toggleUpdateNoticeOutdatedQa: () => void;
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
    }),
    {
      name: "developer-options-storage",
    },
  ),
);

const useDeveloperOptionsStore = createSelectors(useDeveloperOptionsStoreBase);

export default useDeveloperOptionsStore;
