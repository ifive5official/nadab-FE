// 댓글 관리 버튼 누를 시 뜨는 모달
// 삭제, 수정, 신고 등...
import ListModal from "@/components/ListModal";
import type { Item } from "@/store/bottomModalStore";
import { AnimatePresence } from "motion/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  canReport: boolean;
  canDelete: boolean;
  onEditClick?: () => void;
  onReportClick?: () => void;
  onDeleteClick?: () => void;
};

export function CommentMenu({
  isOpen,
  onClose,
  canEdit,
  canReport,
  canDelete,
  onEditClick,
  onReportClick,
  onDeleteClick,
}: Props) {
  const buttons: Item[] = [];

  if (canEdit) {
    buttons.push({
      type: "normal",
      label: "수정",
      onClick: () => {
        onEditClick?.();
        onClose();
      },
    });
  }
  if (canReport) {
    buttons.push({
      type: "normal",
      label: "신고",
      onClick: () => {
        onReportClick?.();
        onClose();
      },
    });
  }
  if (canDelete) {
    buttons.push({
      type: "warning",
      label: "삭제",
      onClick: () => {
        onDeleteClick?.();
        onClose();
      },
    });
  }

  return (
    <>
      {isOpen && (
        <>
          <div
            className="z-20 fixed inset-0 bg-neutral-dark-50"
            onClick={onClose}
          />
          <AnimatePresence>
            <ListModal
              className="inset-x-padding-x-m fixed top-1/2 -translate-y-1/2"
              items={buttons}
              animationVariants={{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }}
            />
          </AnimatePresence>
        </>
      )}
    </>
  );
}
