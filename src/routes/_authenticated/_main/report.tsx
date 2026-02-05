import SegmentedControls from "@/components/SegmentedControls";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PeriodicReportTab from "@/features/report/PeriodicReportTab";
import TotalReportTab from "@/features/report/TotalReportTab";
import Container from "@/components/Container";
import { periodicReportOptions } from "@/features/report/quries";
import Loading from "@/components/Loading";

type Tab = "periodic" | "category";

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
        await Promise.all([
          queryClient.ensureQueryData(periodicReportOptions("weekly")),
          queryClient.ensureQueryData(periodicReportOptions("monthly")),
        ]);
        break;
      case "category":
        break;
    }
  },
  pendingComponent: () => <Loading />,
  pendingMs: 200, // 0.2초 이상 걸릴 때만 로딩 컴포넌트 표시
  pendingMinMs: 200,
});

function RouteComponent() {
  const [selected, setSelected] = useState("periodic");

  return (
    <Container hasHeader={false}>
      <SegmentedControls
        options={[
          { label: "주간/월간", value: "periodic" },
          { label: "유형", value: "category" },
        ]}
        selected={selected}
        className="my-padding-y-m"
        onChange={setSelected}
      />
      <div className="relative -mx-padding-x-m">
        <div className="border-b border-b-interactive-border-default w-full" />
      </div>
      {selected === "periodic" && <PeriodicReportTab />}
      {selected === "category" && <TotalReportTab />}
    </Container>
  );
}
