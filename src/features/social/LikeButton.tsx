// 게시글 및 댓글에서 쓰이는 좋아요 버튼
import { motion, useAnimation } from "motion/react";
import type { useLongPress } from "@/hooks/useLongPress";
import { useEffect, useRef } from "react";
import { FeedHeartFilledIcon, FeedHeartIcon } from "@/components/Icons";

type LongPressResult = ReturnType<typeof useLongPress>;

type Props = {
  isLiked: boolean;
  isMine: boolean;
  likeEvent: LongPressResult;
};

export function LikeButton({ isLiked, isMine, likeEvent }: Props) {
  const controls = useAnimation();
  const isMounted = useRef(false); // 첫 로드 시 애니메이션 미실행

  // 좋아요 상태가 변경될 때 애니메이션 실행(타인 게시물/댓글일 때만)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!isMine && isLiked) {
      controls.start({
        scale: [1, 1.4, 0.9, 1],
        transition: { duration: 0.3, ease: "easeInOut" },
      });
    }
  }, [isLiked, isMine, controls]);

  return (
    <motion.button initial={false} {...likeEvent} animate={controls}>
      {isLiked ? <FeedHeartFilledIcon /> : <FeedHeartIcon />}
    </motion.button>
  );
}
