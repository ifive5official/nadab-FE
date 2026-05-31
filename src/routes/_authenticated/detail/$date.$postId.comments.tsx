import BottomSheet from "@/components/BottomSheet";
import { CommentList } from "@/features/social/CommentList";
import { commentsOptions } from "@/features/social/commentQueries";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import axios from "axios";

export const Route = createFileRoute(
  "/_authenticated/detail/$date/$postId/comments",
)({
  component: RouteComponent,
  loader: async ({ params: { postId }, context: { queryClient } }) => {
    try {
      await queryClient.prefetchInfiniteQuery(commentsOptions(Number(postId)));
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 404) {
          throw notFound() as any;
        }
      }
      throw err;
    }
  },
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return (
    <>
      <BottomSheet title="댓글">
        <CommentList dailyReportId={Number(postId)} readOnly />
      </BottomSheet>
      <Outlet />
    </>
  );
}
