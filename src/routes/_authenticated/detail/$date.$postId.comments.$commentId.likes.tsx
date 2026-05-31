import BottomSheet from "@/components/BottomSheet";
import { commentLikesOptions } from "@/features/social/likeQueries";
import { LikeUserList } from "@/features/social/LikeUserList";
import { createFileRoute, notFound } from "@tanstack/react-router";
import axios from "axios";

export const Route = createFileRoute(
  "/_authenticated/detail/$date/$postId/comments/$commentId/likes",
)({
  component: RouteComponent,
  loader: async ({ params: { commentId }, context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(commentLikesOptions(Number(commentId)));
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
  const { commentId } = Route.useParams();
  return (
    <BottomSheet title="좋아요" hasBackground={false}>
      <LikeUserList queryOptions={commentLikesOptions(Number(commentId))} />
    </BottomSheet>
  );
}
