import SegmentedControls from "@/components/SegmentedControls";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";
import PeriodicReportTab from "@/features/report/PeriodicReportTab";
import TypeReportTab from "@/features/report/TypeReportTab";
import Container from "@/components/Container";
import {
  periodicReportOptions,
  typeReportOptions,
} from "@/features/report/quries";
import Loading from "@/components/Loading";

type Tab = "periodic" | "type";

export const Route = createFileRoute("/_authenticated/_main/report")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    return {
      tab: (search.tab as Tab) || "periodic", // 기본값 periodic
    };
  },
  loaderDeps: ({ search: { tab } }) => ({ tab }),
  loader: async ({ deps: { tab }, context: { queryClient } }) => {
    switch (tab) {
      case "periodic":
        queryClient.ensureQueryData(periodicReportOptions("weekly"));
        queryClient.ensureQueryData(periodicReportOptions("monthly"));
        break;
      case "type":
        queryClient.ensureQueryData(typeReportOptions);
        break;
    }
  },
});

function RouteComponent() {
  const tab = Route.useSearch().tab ?? "periodic";

  const navigate = useNavigate({ from: Route.fullPath });
  function handleTabChange(value: string) {
    navigate({
      search: (prev) => ({ ...prev, tab: value as Tab }),
      replace: true,
    });
  }

  return (
    <Container isMain={true}>
      <SegmentedControls
        options={[
          { label: "주간/월간", value: "periodic" },
          { label: "유형", value: "type" },
        ]}
        selected={tab}
        className="my-padding-y-m"
        onChange={handleTabChange}
      />

      <Suspense fallback={<Loading />}>
        {tab === "periodic" && <PeriodicReportTab />}
        {tab === "type" && <TypeReportTab />}
      </Suspense>
    </Container>
  );
}
