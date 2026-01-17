import { InfoIcon, NoResultIcon } from "@/components/Icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import clsx from "clsx";

// Todo: 전체 분석 api 연동
export default function TotalReportTab() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <>
      <section className="relative px-padding-x-m py-padding-y-m h-full flex flex-col items-center justify-center">
        <div className="flex-2" />
        <NoResultIcon className="p-3.5" />
        <div className="mt-margin-y-s mb-gap-y-m flex flex-col items-center text-center gap-margin-y-l">
          <p className="text-title-1">
            전체 분석이 아직
            <br />
            완성되지 못했어요.
          </p>
          <p className="text-caption-m">
            이야기를 조금 더 채워주시면,
            <br />
            {currentUser.nickname}님만의 분석을 전해드릴게요.
          </p>
          <button
            onClick={() => setIsPopoverOpen(true)}
            className="w-fit px-padding-x-xs py-1.5 rounded-[20px] border border-button-tertiary-border-default bg-button-tertiary-bg-default flex gap-gap-x-xs"
          >
            <InfoIcon size={20} fill="var(--color-icon-default)" />
            <span className="text-button-3">더 알아보기</span>
          </button>
        </div>
        <Popover
          isOpen={true}
          onClose={() => setIsPopoverOpen(false)}
          className={clsx(
            "bg-surface-layer-1!",
            isPopoverOpen ? "" : "invisible"
          )}
        />
        <div className="flex-1" />
      </section>
    </>
  );
}
