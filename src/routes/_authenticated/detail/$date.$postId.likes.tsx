import BottomSheet from "@/components/BottomSheet";
import { likesOptions } from "@/features/social/likeQueries";
import { LikeUserList } from "@/features/social/LikeUserList";
import { createFileRoute, notFound } from "@tanstack/react-router";
import axios from "axios";

export const Route = createFileRoute(
  "/_authenticated/detail/$date/$postId/likes",
)({
  component: RouteComponent,
  loader: async ({ params: { postId }, context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(likesOptions(Number(postId)));
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
    <BottomSheet title="좋아요">
      <LikeUserList queryOptions={likesOptions(Number(postId))} />
    </BottomSheet>
  );
}
