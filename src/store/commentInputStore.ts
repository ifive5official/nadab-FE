// 피드 댓글 입력창에 쓰이는 상태
import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  mode: "IDLE" | "WRITE" | "SUB" | "EDIT";
  dailyReportId?: number;
  parentCommentId?: number;
  parentCommentAuthorNickname?: string;
  isParentSecret?: boolean;
  commentId?: number;
  originalCommentContent?: string;
  isOriginalCommentSecret?: boolean;

  // 댓글 작성 시 스크롤 올리기 위해 추가
  scrollTopSignal: number;
};

type Action = {
  setWriteMode: (dailyReportId: number) => void;
  setSubMode: (
    parentCommentId: number,
    parentCommentAuthorNickname: string,
    isParentSecret: boolean,
  ) => void;
  setEditMode: (
    commentId: number,
    originalCommentContent: string,
    isOriginalCommentSecret: boolean,
    dailyReportId?: number, // 대댓글 아닌 경우
    parentCommentId?: number, // 대댓글인 경우
    parentCommentAuthorNickname?: string, // 대댓글인 경우
  ) => void;

  triggerScrollToTop: () => void;
};

export const useCommentInputBase = create<State & Action>((set) => ({
  mode: "IDLE",
  setWriteMode: (dailyReportId) =>
    set({
      mode: "WRITE",
      dailyReportId: dailyReportId,
      parentCommentId: undefined,
      parentCommentAuthorNickname: undefined,
      isParentSecret: false,
      commentId: undefined,
      originalCommentContent: undefined,
      isOriginalCommentSecret: false,
    }),
  setSubMode: (parentCommentId, parentCommentAuthorNickname, isParentSecret) =>
    set({
      mode: "SUB",
      parentCommentId,
      parentCommentAuthorNickname,
      isParentSecret,
    }),
  setEditMode: (
    commentId,
    originalCommentContent,
    isOriginalCommentSecret,
    dailyReportId,
    parentCommentId,
    parentCommentAuthorNickname,
  ) =>
    set({
      mode: "EDIT",
      commentId,
      originalCommentContent,
      isOriginalCommentSecret,
      dailyReportId,
      parentCommentId,
      parentCommentAuthorNickname,
    }),

  // // 댓글 작성 시 스크롤 올리기 위해 추가
  scrollTopSignal: 0,
  triggerScrollToTop: () =>
    set((state) => ({ scrollTopSignal: state.scrollTopSignal + 1 })),
}));

const useCommentInputStore = createSelectors(useCommentInputBase);

export default useCommentInputStore;
