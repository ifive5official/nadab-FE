import BottomSheet from "@/components/BottomSheet";
import { likesOptions } from "@/features/social/likeQueries";
import { LikeUserList } from "@/features/social/LikeUserList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/_main/social/$postId/likes",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return (
    <BottomSheet title="좋아요">
      <LikeUserList queryOptions={likesOptions(Number(postId))} />
    </BottomSheet>
  );
}
