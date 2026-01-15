import SegmentedControls from "@/components/SegmentedControls";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PeriodicReportTab from "@/features/report/PeriodicReportTab";
import TotalReportTab from "@/features/report/TotalReportTab";

export const Route = createFileRoute("/_authenticated/_main/report")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState("periodic");

  return (
    <>
      <SegmentedControls
        options={[
          { label: "주간/월간", value: "periodic" },
          { label: "전체", value: "total" },
        ]}
        selected={selected}
        className="my-padding-y-m"
        onChange={setSelected}
      />
      <div className="relative -mx-padding-x-m">
        <div className="border-b border-b-interactive-border-default w-full" />
      </div>
      {selected === "periodic" && <PeriodicReportTab />}
      {selected === "total" && <TotalReportTab />}
    </>
  );
}
