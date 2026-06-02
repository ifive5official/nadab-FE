/**
 * @description 현재는 유형 리포트 탭에서 리포트 생성 조건 충족 표시 용으로만 사용됨
 * @note 다른 용도로 사용 시 구조 변경 필요
 */

import clsx from "clsx";
import InlineButton from "./InlineButton";

type Props = {
  className?: string;
  typeName: string; // 유형 이름
  canGenerate: boolean; // 알림 뱃지 여부
  dailyCompletedCount: number; // 완료 숫자
  requiredCount: number; // 요구 숫자
};

export default function TopNotification({
  className,
  typeName,
  canGenerate,
  dailyCompletedCount,
  requiredCount,
}: Props) {
  return (
    <div
      className={clsx(
        "w-full flex items-center px-padding-x-m bg-surface-layer-2 rounded-2xl",
        canGenerate ? "py-padding-y-s" : "py-padding-y-m",
        className,
      )}
    >
      <div className="mr-auto">
        {canGenerate ? (
          <div className="flex gap-padding-x-s items-center">
            <div className="w-12 aspect-square bg-surface-base rounded-full">
              <img
                src="icon/type-report.png"
                alt="유형 리포트 아이콘"
                className="w-12 aspect-square"
              />
            </div>
            <div>
              <p className="text-label-s">{typeName} 유형 리포트 조건 충족</p>
              <p className="text-caption-s">
                {typeName} 유형 리포트를 만들 수 있어요.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-caption-m">
            {typeName} 리포트 완성까지 {requiredCount - dailyCompletedCount}개
            남았어요.
          </p>
        )}
      </div>
      <InlineButton size="xs" variant="tertiary">
        <span
          className={clsx("font-bold!", canGenerate && "text-brand-primary!")}
        >
          {dailyCompletedCount}
        </span>
        <span className="text-interactive-text-disabled">
          {" "}
          / {requiredCount}
        </span>
      </InlineButton>
    </div>
  );
}
