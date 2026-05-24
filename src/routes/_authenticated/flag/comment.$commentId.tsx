import ReportForm from "@/features/social/ReportForm";
import { createFileRoute } from "@tanstack/react-router";

type SearchParams = {
  parentCommentId?: number | undefined;
};

export const Route = createFileRoute("/_authenticated/flag/comment/$commentId")(
  {
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): SearchParams => {
      return {
        parentCommentId: search.parentCommentId
          ? Number(search.parentCommentId)
          : undefined,
      };
    },
  },
);

function RouteComponent() {
  const { commentId } = Route.useParams();
  const { parentCommentId } = Route.useSearch();

  return (
    <ReportForm
      commentId={Number(commentId)}
      title="댓글 신고"
      parentCommentId={parentCommentId}
    />
  );
}
