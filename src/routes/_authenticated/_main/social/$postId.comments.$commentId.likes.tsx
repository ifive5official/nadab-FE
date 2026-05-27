import BottomSheet from "@/components/BottomSheet";
import ErrorPage from "@/components/ErrorPage";
import { commentLikesOptions } from "@/features/social/likeQueries";
import { LikeUserList } from "@/features/social/LikeUserList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/_main/social/$postId/comments/$commentId/likes",
)({
  component: RouteComponent,
  notFoundComponent: () => <ErrorPage error={{ message: "404 Not Found" }} />,
  loader: async ({ params: { commentId }, context: { queryClient } }) => {
    queryClient.ensureQueryData(commentLikesOptions(Number(commentId)));
  },
});

function RouteComponent() {
  const { commentId } = Route.useParams();
  return (
    <BottomSheet title="좋아요" hasBackground={false}>
      <LikeUserList queryOptions={commentLikesOptions(Number(commentId))} />
    </BottomSheet>
  );
}
