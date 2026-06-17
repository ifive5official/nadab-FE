import BottomSheet from "@/components/BottomSheet";
import { CommentList } from "@/features/social/CommentList";
import { commentsOptions } from "@/features/social/commentQueries";
import { formatISODate } from "@/lib/formatters";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/detail/$date/$postId/comments",
)({
  component: RouteComponent,
  loader: async ({ params: { postId }, context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(commentsOptions(Number(postId)));
  },
});

function RouteComponent() {
  const { postId, date } = Route.useParams();
  return (
    <>
      <BottomSheet
        title="댓글"
        onCloseTo={{
          to: "/detail/$date",
          params: { date: formatISODate(new Date(date)) },
        }}
      >
        <CommentList dailyReportId={Number(postId)} readOnly />
      </BottomSheet>
      <Outlet />
    </>
  );
}
