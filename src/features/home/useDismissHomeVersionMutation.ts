import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiErrResponse } from "@/generated/api";
import type { AxiosError } from "axios";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Req = components["schemas"]["HomeVersionDismissRequest"];
type HomeRes = components["schemas"]["HomeResponse"];

export function useDismissHomeVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appVersionId }: Req) => {
      await api.post("/api/v1/home/version-dismissals", {
        appVersionId,
      });
    },
    onSuccess: (_, { appVersionId }) => {
      queryClient.setQueryData(["currentUser", "home"], (oldData?: HomeRes) => {
        if (!oldData?.latestVersion) return oldData;

        return {
          ...oldData,
          latestVersion: {
            ios:
              oldData.latestVersion.ios?.appVersionId === appVersionId
                ? { ...oldData.latestVersion.ios, dismissed: true }
                : oldData.latestVersion.ios,
            android:
              oldData.latestVersion.android?.appVersionId === appVersionId
                ? { ...oldData.latestVersion.android, dismissed: true }
                : oldData.latestVersion.android,
          },
        };
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
