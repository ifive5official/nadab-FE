import { WarningFilledIcon } from "./Icons";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ErrorPage({ error }: { error: any }) {
  // const isAxiosNetworkError = error.code === "ERR_NETWORK";
  // const isModuleLoadError =
  //   error instanceof TypeError &&
  //   (error.message.includes("fetch") || error.message.includes("import"));

  // const title =
  //   isAxiosNetworkError || isModuleLoadError
  //     ? "네트워크 연결 상태가 불안정해요."
  //     : error.message;

  // const message =
  //   isAxiosNetworkError || isModuleLoadError
  //     ? "네트워크 연결 상태를 확인해주세요."
  //     : "새로고침 후 다시 시도해주세요.";

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-gap-y-l">
        <WarningFilledIcon />
        <button
          onClick={() => {
            window.location.reload();
          }}
        >
          새로고침(임시)
        </button>
        {/* <span className="text-title-2">{title}</span>
        <span className="text-body-2">{message}</span> */}
        <p className="w-full whitespace-pre-wrap break-all px-4">
          {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
        </p>
      </div>
    </div>
  );
}
