// 홈 상단 오늘의 질문 섹션
import ProfileImg from "@/components/ProfileImg";
import BlockButton from "@/components/BlockButton";
import clsx from "clsx";
import { Link } from "@tanstack/react-router";

export default function QuestionSection() {
  const friends = Array(7).fill(0); // 임시
  const MAX_VISIBLE = 5;
  const hasFriends = friends.length > 0;
  const visibleFriends =
    friends.length <= MAX_VISIBLE ? friends : friends.slice(0, MAX_VISIBLE - 1);
  return (
    <section className="-mx-padding-x-m px-padding-x-m py-padding-y-xl bg-surface-layer-2">
      <div className="flex flex-col gap-gap-y-l">
        <div className="w-fit text-caption-m rounded-3xl border px-padding-x-xs py-padding-y-xxs text-brand-primary border-brand-primary">
          오늘의 질문
        </div>
        <h2 className="text-title-1 break-keep">
          인생의 마지막 날, 되돌아본다면 나에게 어떤 말을 할까요?
        </h2>
        {hasFriends && (
          <div className="mt-margin-y-xxl mb-gap-y-xl flex flex-col gap-gap-y-s">
            <p className="text-caption-l text-text-secondary">
              이 질문에 답변한 친구들
            </p>
            <div className="flex">
              {visibleFriends.map((_friend, i) => (
                <ProfileImg
                  key={i}
                  width={36}
                  src={undefined}
                  className="-mr-2.5"
                />
              ))}
              {friends.length > MAX_VISIBLE && (
                <div className="w-9 aspect-square rounded-full flex justify-center items-center text-label-s bg-button-primary-bg-default border border-interactive-border-default text-text-inverse-primary">
                  +{friends.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={clsx(
            "flex gap-margin-x-m",
            hasFriends ? "" : "mt-margin-y-xxxl"
          )}
        >
          <BlockButton variant="tertiary">새로운 질문 받기</BlockButton>
          <Link to="/today" className="block w-full">
            <BlockButton>쓰러가기</BlockButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
