import BottomSheet from "@/components/BottomSheet";
import { likesOptions } from "@/features/social/likeQueries";
import { LikeUserList } from "@/features/social/LikeUserList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/detail/$date/$postId/likes",
)({
  component: RouteComponent,
  loader: async ({ params: { postId }, context: { queryClient } }) => {
    queryClient.ensureQueryData(likesOptions(Number(postId)));
  },
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return (
    <BottomSheet title="좋아요">
      <LikeUserList queryOptions={likesOptions(Number(postId))} />
    </BottomSheet>
  );
}
