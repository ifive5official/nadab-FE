// 좌측 위에 제목이 있고 우측 하단에 버튼이 있고 가운데 큰 컨텐츠가 있는 모달
// 아직 알림 시간 변경에만 사용함
// Todo: 모달과 합칠 수 없나
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import "@ncdai/react-wheel-picker/style.css";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import BlockButton from "./BlockButton";

const createArray = (length: number, add = 0): WheelPickerOption<number>[] =>
  Array.from({ length }, (_, i) => {
    const value = i + add;
    return {
      label: value.toString().padStart(2, "0"),
      value: value,
    };
  });

const hourOptions = createArray(12, 1);
const minuteOptions = createArray(60);
const meridiemOptions: WheelPickerOption[] = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function TimePickerModal({ isOpen, onConfirm, onClose }: Props) {
  // 하단에서 올라오는 애니메이션으로 인한 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="z-20 fixed inset-0 bg-neutral-dark-50"
            onClick={onClose}
          />
          <motion.div
            className="z-30 fixed bottom-padding-y-m inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col gap-gap-y-xl px-padding-x-xl py-padding-y-xl bg-surface-base shadow-3 border border-border-base rounded-2xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="text-title-3">알림 시간 변경</p>
            <div className="flex justify-center">
              <WheelPickerWrapper className="w-50! rounded-md bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <WheelPicker
                  options={hourOptions}
                  defaultValue={8}
                  infinite
                  classNames={{
                    optionItem: "text-zinc-400 dark:text-zinc-500",
                    highlightWrapper:
                      "bg-zinc-100 text-text-primary dark:bg-zinc-900 dark:text-zinc-50 rounded-l-[7px]",
                  }}
                />
                <WheelPicker
                  options={minuteOptions}
                  defaultValue={0}
                  infinite
                  classNames={{
                    optionItem: "text-zinc-400 dark:text-zinc-500",
                    highlightWrapper:
                      "bg-zinc-100 text-text-primary dark:bg-zinc-900 dark:text-zinc-50",
                  }}
                />
                <WheelPicker
                  options={meridiemOptions}
                  defaultValue="AM"
                  classNames={{
                    optionItem: "text-zinc-400 dark:text-zinc-500",
                    highlightWrapper:
                      "bg-zinc-100 text-text-primary dark:bg-zinc-900 dark:text-zinc-50 rounded-r-[7px]",
                  }}
                />
              </WheelPickerWrapper>
            </div>
            <div className="flex justify-end gap-gap-x-s">
              <BlockButton
                btnType="inline"
                variant="secondary"
                onClick={onClose}
              >
                취소
              </BlockButton>
              <BlockButton btnType="inline" onClick={onConfirm}>
                확인
              </BlockButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!
  );
}
