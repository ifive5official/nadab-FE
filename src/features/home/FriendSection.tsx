// 홈 하단 답변에 질문한 친구들 섹션
import ProfileImg from "@/components/ProfileImg";

type Props = {
  friends: number[];
};

// Todo: api에 맞춰 friends 구조 변경
export default function FriendSection({ friends }: Props) {
  const MAX_VISIBLE = 5;
  const visibleFriends =
    friends.length <= MAX_VISIBLE ? friends : friends.slice(0, MAX_VISIBLE - 1);
  return (
    <div className="flex flex-col justify-center items-center gap-gap-y-xs">
      <p className="text-caption-m text-text-secondary dark:text-neutral-800">
        이 질문에 답변한 친구들
      </p>
      <div className="flex">
        {visibleFriends.map((_friend, i) => (
          <ProfileImg key={i} width={28} src={undefined} className="-mr-1.5" />
        ))}
        {friends.length > MAX_VISIBLE && (
          <div className="w-9 aspect-square rounded-full flex justify-center items-center text-label-s bg-button-primary-bg-default border border-interactive-border-default dark:border-0 text-text-inverse-primary">
            +{friends.length - 4}
          </div>
        )}
      </div>
    </div>
  );
}
