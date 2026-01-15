// 레포트 생성 중 로딩 화면
import { LoadingSpinnerIcon } from "@/components/Icons";

type Props = {
  type: "weekly" | "monthly";
};

export default function ReportGeneratingOverlay({ type }: Props) {
  return (
    <div className="fixed z-30 inset-0 sm:mx-auto sm:w-[412px] bg-surface-base">
      <div className="absolute inset-0 bg-[url(/background.png)] bg-cover opacity-60 dark:opacity-70" />
      <div className="relative h-full flex flex-col gap-margin-y-xxl items-center justify-center text-center">
        <LoadingSpinnerIcon />
        <div>
          <p className="text-title-2">
            현재 {type === "weekly" ? "주" : "월"}간 리포트를
            <br />
            생성 중이에요.
          </p>
          <p className="text-body-2 mt-margin-y-s">
            리포트 생성에 1~2분 정도 걸릴 수 있어요.
            <br />
            조금만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
