import ReportForm from "@/features/social/ReportForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/flag/report/$reportId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { reportId } = Route.useParams();

  return <ReportForm dailyReportId={Number(reportId)} title="게시글 신고" />;
}
