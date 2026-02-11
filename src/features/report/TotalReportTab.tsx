import { InfoIcon } from "@/components/Icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import clsx from "clsx";
import NoResult from "@/components/NoResult";

// Todo: 전체 리포트 api 연동
export default function TotalReportTab() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <>
      <section className="relative px-padding-x-m py-padding-y-m h-full flex flex-col items-center justify-center">
        <NoResult
          className="mt-[calc((80/796)*100dvh)] mb-gap-y-l"
          title={`유형 리포트가 아직\n완성되지 못했어요.`}
          description={`이야기를 조금 더 채워주시면,\n${currentUser.nickname}님만의 리포트를 전해드릴게요.`}
        />

        <button
          onClick={() => setIsPopoverOpen(true)}
          className="mb-gap-y-m w-fit px-padding-x-xs py-1.5 rounded-[20px] border border-button-tertiary-border-default bg-button-tertiary-bg-default flex gap-gap-x-xs"
        >
          <InfoIcon size={20} fill="var(--color-icon-default)" />
          <span className="text-button-3">더 알아보기</span>
        </button>
        <Popover
          isOpen={true}
          onClose={() => setIsPopoverOpen(false)}
          className={clsx(
            "bg-surface-layer-1!",
            isPopoverOpen ? "" : "invisible",
          )}
        />
      </section>
    </>
  );
}
