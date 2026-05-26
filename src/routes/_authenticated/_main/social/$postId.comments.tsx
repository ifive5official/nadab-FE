import BottomSheet from "@/components/BottomSheet";
import { CommentList } from "@/features/social/CommentList";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/_main/social/$postId/comments",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return (
    <>
      <BottomSheet title="댓글">
        <CommentList dailyReportId={Number(postId)} />
      </BottomSheet>
      <Outlet />
    </>
  );
}
