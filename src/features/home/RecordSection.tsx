// 홈 하단 나의 기록 섹션
import { DayCheckIcon } from "@/components/Icons";
import clsx from "clsx";

export default function RecordSection() {
  return (
    <div className="flex flex-col items-center gap-gap-y-xs">
      <p className="text-caption-l text-text-secondary text-center">
        2일 연속 기록을 이어나가다니 대단해요!
      </p>
      <div className="flex gap-gap-x-xs">
        <DayRecord day="월" checked={true} />
        <DayRecord day="화" checked={true} />
        <DayRecord day="수" checked={false} />
        <DayRecord day="목" checked={false} />
        <DayRecord day="금" checked={false} />
        <DayRecord day="토" checked={false} />
        <DayRecord day="일" checked={false} />
      </div>
    </div>
  );
}

type DayRecordprops = {
  day: string;
  checked: boolean;
};

function DayRecord({ day, checked }: DayRecordprops) {
  return (
    <div className="flex flex-col items-center px-1 pb-2.5">
      <span
        className={clsx(
          "text-label-m",
          checked ? "text-text-primary" : "text-text-disabled"
        )}
      >
        {day}
      </span>
      <div className="py-padding-y-xxs">
        {checked ? (
          <DayCheckIcon />
        ) : (
          <div className="rounded-full w-[31px] aspect-square bg-surface-layer-1" />
        )}
      </div>
    </div>
  );
}
