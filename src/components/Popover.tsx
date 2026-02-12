// 리포트 완성 조건 보여주는 팝오버
// 추후 재사용할 시 내용을 props로 받게 할 예정
import clsx from "clsx";
import { CloseIcon } from "./Icons";
import { REPORT_CONFIGS } from "@/features/report/reportConfigs";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
};

export function Popover({ isOpen, onClose, className }: Props) {
  return (
    <>
      {isOpen && (
        <div
          className={clsx(
            "bg-surface-base shadow-2 rounded-[20px] px-padding-x-m py-padding-y-m flex flex-col gap-gap-y-s",
            className,
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-label-m">리포트 완성 조건</span>
            <button onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <ul className="text-left text-caption-m list-disc list-inside">
            <li>매주/매달 해당 기간의 다음날에 리포트가 도착해요.</li>
            <li>
              주간리포트는 해당 주에 답변을{" "}
              {REPORT_CONFIGS["weekly"].requiredAnswers}건 이상 작성 시
              완성돼요.
            </li>
            <li>
              월간리포트는 해당 월에 답변을{" "}
              {REPORT_CONFIGS["monthly"].requiredAnswers}건 이상 작성 시
              완성돼요.
            </li>
            <li>유형리포트는 30개 이상의 답변을 작성해야 제공돼요.</li>
          </ul>
        </div>
      )}
    </>
  );
}
