import {
  LockFilledIcon,
  MoreHorizontalIcon,
  WarningFilledIcon,
} from "@/components/Icons";
import ProfileImg from "@/components/ProfileImg";
import type { components } from "@/generated/api-types";
import { useDeleteCommentMutation } from "./commentQueries";
import { useState } from "react";
import { formatRelativeDate } from "@/lib/formatters";
import clsx from "clsx";
import { SubCommentList } from "./SubCommentList";
import { CommentMenu } from "./CommentMenu";
import { useNavigate } from "@tanstack/react-router";
import useCommentInputStore from "@/store/commentInputStore";
import useModalStore from "@/store/modalStore";
import {
  useCommentLikeMutation,
  useCommentUnLikeMutation,
} from "./likeQueries";
import { useLongPress } from "@/hooks/useLongPress";
import { LikeButton } from "./LikeButton";

type Comment = components["schemas"]["CommentResponse"];
type CommentProps = {
  dailyReportId: number;
  comment: Comment;
  parentComment?: Comment; // 대댓글일 경우
};
export function Comment({
  dailyReportId,
  comment,
  parentComment,
}: CommentProps) {
  const navigate = useNavigate();
  const isSecret = !comment.canViewContent;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setSubMode, setEditMode } = useCommentInputStore();
  const { showModal, closeModal } = useModalStore();

  // 좋아요
  const likeMutation = useCommentLikeMutation();
  const unLikeMutation = useCommentUnLikeMutation();

  function handleClickLike() {
    // 남의 댓글만 짧게 누를 시 좋아요 가능
    if (comment.isMine) return;

    if (comment.isLiked) {
      unLikeMutation.mutate({
        dailyReportId: dailyReportId,
        commentId: comment.commentId!,
        parentCommentId: parentComment?.commentId,
      });
    } else {
      likeMutation.mutate({
        dailyReportId: dailyReportId,
        commentId: comment.commentId!,
        parentCommentId: parentComment?.commentId,
      });
    }
  }

  function handleLongPressLike() {
    // 길게 누를 시 좋아요 목록 확인 가능
    navigate({ to: `/social/$postId/comments/${comment.commentId}/likes` });
  }

  const likeEvent = useLongPress(handleLongPressLike, handleClickLike);

  // 댓글 관리
  const deleteCommentMutation = useDeleteCommentMutation();

  return (
    <li className="relative">
      <div className="flex gap-gap-x-l items-start">
        {isSecret ? (
          <div className="aspect-square w-9 rounded-full flex items-center justify-center bg-surface-layer-3">
            <LockFilledIcon />
          </div>
        ) : (
          <ProfileImg width={36} src={comment.authorProfileImageUrl} />
        )}
        <div className="flex-1 flex flex-col items-start gap-1">
          <div className="flex gap-gap-x-s items-center">
            <span className="text-button-2">
              {isSecret ? "이름 없는 친구" : comment.authorNickname}
            </span>
            <span className="text-caption-m text-text-tertiary">
              {formatRelativeDate(comment.createdAt!)}
            </span>
            {!isSecret && (
              <button onClick={() => setIsMenuOpen(true)}>
                <MoreHorizontalIcon size={20} fill="var(--color-icon-muted)" />
              </button>
            )}
          </div>
          <p
            className={clsx("text-caption-l", isSecret && "text-text-tertiary")}
          >
            {isSecret ? "비밀 댓글이에요." : comment.content}
          </p>
          {!isSecret && !parentComment && (
            <button
              onClick={() =>
                setSubMode(
                  comment.commentId!,
                  comment.authorNickname!,
                  comment.isSecret!,
                )
              }
              className="text-caption-l underline"
            >
              답글 남기기
            </button>
          )}
        </div>
        {!isSecret && (
          <LikeButton
            isLiked={
              !!(comment.isLiked! || (comment.isMine && comment.hasLikes))
            }
            isMine={comment.isMine!}
            likeEvent={likeEvent}
          />
        )}
      </div>
      <SubCommentList dailyReportId={dailyReportId} parentComment={comment} />
      <CommentMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        canEdit={!!comment.isMine}
        canReport={!comment.isMine && !!comment.canViewContent}
        canDelete={comment.canDelete!}
        onEditClick={() => {
          setEditMode(
            comment.commentId!,
            comment.content!,
            comment.isSecret!,
            dailyReportId,
            parentComment?.commentId,
            parentComment?.authorNickname,
          );
        }}
        onReportClick={() => {
          navigate({
            to: `/flag/comment/${comment.commentId!}`,
            search: {
              parentCommentId: parentComment?.commentId,
            },
          });
        }}
        onDeleteClick={() =>
          showModal({
            icon: WarningFilledIcon,
            title: "댓글을 삭제하시겠어요?",
            children: "삭제된 댓글은 복구할 수 없어요.",
            buttons: [
              {
                label: "취소",
                onClick: closeModal,
              },
              {
                label: "확인",
                onClick: () => {
                  closeModal();
                  deleteCommentMutation.mutate({
                    commentId: comment.commentId!,
                    dailyReportId,
                    parentCommentId: parentComment?.commentId,
                  });
                },
              },
            ],
          })
        }
      />
    </li>
  );
}
