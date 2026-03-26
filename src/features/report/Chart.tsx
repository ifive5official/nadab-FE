import type { components } from "@/generated/api-types";
import { useSwiperSlide } from "swiper/react";
import { animate, motion } from "motion/react";
import { findEmotionByCode } from "@/constants/emotions";
import { useEffect, useRef } from "react";

type Props = {
  typeReport: components["schemas"]["TypeReportResponse"];
};

export default function Chart({ typeReport }: Props) {
  const { isActive } = useSwiperSlide();

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const barVariants = {
    initial: { height: "0%", opacity: 0 },
    animate: (customHeight: number) => ({
      height: `${customHeight}%`,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1] as const,
      },
    }),
  };

  return (
    <motion.div
      className="flex-1 flex gap-gap-x-s mb-gap-y-l"
      variants={containerVariants}
      initial="initial"
      animate={isActive ? "animate" : "initial"}
    >
      {typeReport.emotionStats?.emotions?.map((emotion) => {
        const targetHeight =
          (emotion.percent! /
            (typeReport.emotionStats?.emotions?.[0].percent ?? 100)) *
          80;

        return (
          <div
            key={emotion.emotionName}
            className="h-full flex-1 flex flex-col items-center justify-end gap-gap-y-xs"
          >
            <span className="text-label-s">
              <AnimatedCounter to={emotion.percent!} isActive={isActive} />%
            </span>
            <motion.div
              custom={targetHeight}
              variants={barVariants}
              style={{
                backgroundColor: findEmotionByCode(emotion.emotionCode!)?.color,
              }}
              className="rounded-t-lg w-full"
            />

            <span className="text-label-s text-text-secondary">
              {emotion.emotionName}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}

function AnimatedCounter({ to, isActive }: { to: number; isActive: boolean }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    // @ts-ignore
    node.textContent = "0";
    if (isActive) {
      const node = nodeRef.current;

      const controls = animate(0, to, {
        duration: 0.5,
        onUpdate(value) {
          // @ts-ignore
          node.textContent = Math.floor(value);
        },
      });

      return () => controls.stop();
    }
  }, [to, isActive]);

  return <span ref={nodeRef} />;
}
