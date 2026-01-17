// 홈 하단 나의 기록 섹션
import { DayCheckIcon } from "@/components/Icons";
import type { components } from "@/generated/api-types";
import clsx from "clsx";

type homeData = components["schemas"]["HomeResponse"];

type Props = {
  data: homeData;
};

export default function RecordSection({ data }: Props) {
  const weekConfig = [
    { label: "월", index: 1 },
    { label: "화", index: 2 },
    { label: "수", index: 3 },
    { label: "목", index: 4 },
    { label: "금", index: 5 },
    { label: "토", index: 6 },
    { label: "일", index: 0 },
  ];

  // 받은 날짜 배열을 요일 인덱스(0~6)의 집합으로 변환
  const answeredDayIndices = new Set(
    data.answeredDates?.map((dateString) => new Date(dateString).getDay())
  );

  return (
    <div className="flex flex-col items-center gap-gap-y-xs">
      <p className="text-caption-l text-text-secondary text-center">
        {data.streakCount}일 연속 기록을 이어나가다니 대단해요!
      </p>
      <div className="flex gap-gap-x-xs">
        {weekConfig.map((day) => (
          <DayRecord
            key={day.label}
            day={day.label}
            checked={answeredDayIndices.has(day.index)}
          />
        ))}
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
          <div className="rounded-full w-[31px] aspect-square bg-surface-layer-1 dark:bg-surface-layer-3" />
        )}
      </div>
    </div>
  );
}
