import { InfoIcon } from "@/components/Icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import clsx from "clsx";
import NoResult from "@/components/NoResult";
import type categories from "@/constants/categories";
import { InfoButton } from "./ReportComponents";
import { Badge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";

type Props = {
  category: (typeof categories)[number]["code"];
};

export default function TotalReportTab({ category }: Props) {
  console.log(category); // 임시
  const data = false; // Todo: 전체 리포트 api 연동
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <>
      <section className="relative flex-1 flex flex-col items-center">
        {data ? (
          <div className="w-full pt-padding-y-l flex flex-col">
            <div className="relative mb-margin-y-l">
              <div className="flex items-end">
                <p className="text-title-3 mr-auto">
                  {currentUser.nickname}님은
                  <br />
                  <span className="text-brand-primary">
                    몽글몽글 낭만주의자
                  </span>
                  에요.
                </p>
                <InfoButton onClick={() => setIsPopoverOpen(true)} />
              </div>
              {isPopoverOpen && (
                <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
                  <Popover
                    isOpen={isPopoverOpen}
                    onClose={() => setIsPopoverOpen(false)}
                  />
                </div>
              )}
            </div>
            <img src="temp.png" className="mx-margin-x-l" />
            <div className="flex gap-gap-x-s my-gap-y-l">
              <Badge size="m">#분위기</Badge>
              <Badge size="m">#취향기록</Badge>
              <Badge size="m">#나만의색깔</Badge>
            </div>
            <p className="text-body-2 text-text-secondary">
              {/* eslint-disable react/no-unescaped-entities */}
              오늘의 이야기는 그 영광이 단순히 '결과'가 아니라, 수많은 고민과
              노력을 거쳐 '나는 해낼 수 있다'는 믿음을 스스로 증명해낸 '과정' 그
              자체였음을 보여줘요. 당신 안에 잠재된 힘을 다시 한번 발견한 소중한
              기록입니다. 이 기록은 미래의 당신과 연결될 첫 번째 조각이 될
              거예요.오늘의 이야기는 그 영광이 단순히 '결과'가 아니라,
            </p>
            <div className="my-gap-y-xl flex flex-col gap-gap-y-l">
              <div className="rounded-2xl px-padding-x-m py-padding-y-m bg-field-bg-hover border border-border-base flex flex-col gap-padding-y-xs">
                <p className="text-interactive-text-default text-label-l">
                  도전에 적극적인 태도
                </p>
                <p className="text-text-secondary text-body-2">
                  오늘의 이야기는 그 영광이 단순히 '결과'가 아니라, 수많은
                  고민과 노력을 거쳐 '나는 해낼 수 있다'는 믿음을 스스로
                  증명해낸 '과정' 그 자체였음을 보여줘요. 당신
                </p>
              </div>
              <div className="rounded-2xl px-padding-x-m py-padding-y-m bg-field-bg-hover border border-border-base flex flex-col gap-padding-y-xs">
                <p className="text-interactive-text-default text-label-l">
                  새로운 자극에 민감한 성향
                </p>
                <p className="text-text-secondary text-body-2">
                  오늘의 이야기는 그 영광이 단순히 '결과'가 아니라, 수많은
                  고민과 노력을 거쳐 '나는 해낼 수 있다'는 믿음을 스스로
                  증명해낸 '과정' 그 자체였음을 보여줘요. 당신
                </p>
              </div>
            </div>
            <BlockButton>100 크리스탈로 리포트 새로 받기</BlockButton>
          </div>
        ) : (
          <>
            <div className="flex-1" />
            <NoResult
              className="mb-gap-y-l"
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
            <div className="flex-1 flex flex-col justify-start w-full">
              <Popover
                isOpen={true}
                onClose={() => setIsPopoverOpen(false)}
                className={clsx(
                  "bg-surface-layer-1!",
                  isPopoverOpen ? "" : "invisible",
                )}
              />
            </div>
          </>
        )}
      </section>
    </>
  );
}
