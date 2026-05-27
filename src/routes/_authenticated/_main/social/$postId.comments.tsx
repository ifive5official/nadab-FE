import BottomSheet from "@/components/BottomSheet";
import ErrorPage from "@/components/ErrorPage";
import { CommentList } from "@/features/social/CommentList";
import { commentsOptions } from "@/features/social/commentQueries";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/_main/social/$postId/comments",
)({
  component: RouteComponent,
  notFoundComponent: () => <ErrorPage error={{ message: "404 Not Found" }} />,
  loader: async ({ params: { postId }, context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(commentsOptions(Number(postId)));
  },
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return (
    <>
      <BottomSheet
        title="댓글"
        onCloseTo={{
          to: `/social`,
          search: {
            tab: "feed",
          },
        }}
      >
        <CommentList dailyReportId={Number(postId)} />
      </BottomSheet>
      <Outlet />
    </>
  );
}
