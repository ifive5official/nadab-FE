// 홈 하단 나의 기록 섹션
import { ChevronRightIcon, DayCheckIcon } from "@/components/Icons";

export default function RecordSection() {
  return (
    <section className="flex flex-col gap-gap-y-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-title-2">나의 기록</h2>
        <button className="flex items-center gap-gap-x-xs px-padding-x-xs py-padding-y-xxs border border-button-tertiary-border-default rounded-[20px]">
          <span className="text-button-2 text-button-tertiary-text-default">
            전체보기
          </span>
          <ChevronRightIcon size={20} />
        </button>
      </div>
      <p className="text-body-1 text-center">
        <span className="text-headline-l text-brand-primary">49</span>일째
        <br />
        기록을 남겼어요.
      </p>
      <div className="flex flex-col gap-gap-y-s px-padding-x-m py-padding-y-s bg-surface-layer-1 border border-field-border-default rounded-[20px]">
        <p className="text-caption-l text-text-secondary text-center">
          2일 연속 기록을 이어나가다니 대단해요!
        </p>
        <div className="flex justify-between">
          <DayRecord day="월" checked={true} />
          <DayRecord day="화" checked={true} />
          <DayRecord day="수" checked={false} />
          <DayRecord day="목" checked={false} />
          <DayRecord day="금" checked={false} />
          <DayRecord day="토" checked={false} />
          <DayRecord day="일" checked={false} />
        </div>
      </div>
    </section>
  );
}

type DayRecordprops = {
  day: string;
  checked: boolean;
};

function DayRecord({ day, checked }: DayRecordprops) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-title-3">{day}</span>
      <div className="py-[5px]">
        {checked ? (
          <DayCheckIcon />
        ) : (
          <div className="rounded-full w-[38px] aspect-square bg-field-bg-muted" />
        )}
      </div>
    </div>
  );
}
