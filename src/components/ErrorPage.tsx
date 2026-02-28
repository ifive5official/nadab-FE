import { RefreshIcon, WarningFilledBigIcon } from "./Icons";
import InlineButton from "./InlineButton";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ErrorPage({
  error,
  type,
}: {
  error: any;
  type?: "network" | undefined;
}) {
  const isAxiosNetworkError = error.code === "ERR_NETWORK";
  const isModuleLoadError =
    error instanceof TypeError &&
    (error.message.includes("fetch") || error.message.includes("import"));

  const title =
    isAxiosNetworkError || isModuleLoadError || type === "network"
      ? `네트워크 연결 상태가\n불안정해요.`
      : error.message;

  const message =
    isAxiosNetworkError || isModuleLoadError || type === "network"
      ? "네트워크 연결 상태를 확인해주세요."
      : "새로고침 후 다시 시도해주세요.";

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <div className="absolute w-full sm:w-[412px] inset-y-0 bg-[url(/background.png)] bg-cover opacity-60 dark:opacity-40" />
      <div className="relative flex flex-col text-center items-center gap-padding-y-xxl">
        <WarningFilledBigIcon className="text-brand-primary-alpha-70 dark:text-icon-default" />
        <div className="flex flex-col gap-gap-y-l">
          <span className="text-title-2 whitespace-pre-line">{title}</span>
          <span className="text-body-2">{message}</span>
        </div>
        <InlineButton
          variant="tertiary"
          className="px-padding-x-m! py-padding-y-s!"
          onClick={() => {
            window.location.reload();
          }}
        >
          <div className="flex items-center gap-gap-x-xs">
            <RefreshIcon />
            새로고침하기
          </div>
        </InlineButton>
      </div>
    </div>
  );
}
