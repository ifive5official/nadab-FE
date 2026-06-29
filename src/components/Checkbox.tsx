/**
 * @description 스타일이 적용된 체크박스
 * @props check 상태와 check 시 동작을 전달받음
 * @page 피드 댓글창의 비밀댓글 여부, 신고 사유, 탈퇴, 약관 동의
 * @note size는 개발상의 편의를 위해 임의로 정했는데 추후 개선 고려
 */

import clsx from "clsx";
import { DoneIcon } from "./Icons";

type Props = {
  boxSize?: "m" | "s";
  textSize?: string;
  label: string;
  checked: boolean;
  className?: string;
  onCheck: () => void;
};

export default function CheckBox({
  boxSize = "m",
  label,
  textSize = "text-label-m",
  checked,
  className,
  onCheck,
}: Props) {
  return (
    <div className={clsx("flex items-center gap-gap-x-s", className)}>
      <div
        className={clsx(
          "aspect-square border flex justify-center items-center rounded-sm cursor-pointer",
          boxSize === "m" && "w-5",
          boxSize === "s" && "w-4",
          checked
            ? "bg-brand-primary border-border-alpha"
            : "bg-interactive-bg-default border-border-layer-1",
        )}
        onClick={() => onCheck()}
      >
        {checked && <DoneIcon size={boxSize === "m" ? 16 : 13} />}
      </div>
      <label
        className={clsx(
          "cursor-pointer",
          textSize,
          checked
            ? "text-interactive-text-default"
            : "text-interactive-text-mute",
        )}
        onClick={() => onCheck()}
      >
        {label}
      </label>
    </div>
  );
}
