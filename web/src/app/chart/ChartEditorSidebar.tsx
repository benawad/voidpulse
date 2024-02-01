import React, { useState } from "react";
import { MultiToggleButtonBar } from "../ui/MultiToggleButtonBar";
import { ManualChartOptions } from "./ManualChartOptions";
import { Metric } from "./metric-selector/Metric";
import { ReportType } from "@voidpulse/api";

interface ChartEditorSidebarProps {
  metrics: Metric[];
  setMetrics: React.Dispatch<React.SetStateAction<Metric[]>>;
  reportType: ReportType;
  setReportType: React.Dispatch<React.SetStateAction<ReportType>>;
}

export const ChartEditorSidebar: React.FC<ChartEditorSidebarProps> = ({
  metrics,
  setMetrics,
  reportType,
  setReportType,
}) => {
  const [editorMode, setEditorMode] = useState("ai");
  return (
    <div
      className="border-r p-4 bg-primary-900 border-primary-800"
      style={{ width: 400 }}
    >
      <MultiToggleButtonBar
        className="font-semibold text-md"
        buttonClassName="w-full"
        buttonInfo={[
          {
            name: "AI Chat ✨",
            action: () => {
              setEditorMode("ai");
            },
          },
          {
            name: "Manual 💪",
            action: () => {
              setEditorMode("manual");
            },
          },
        ]}
        selectedButtonIdx={editorMode === "ai" ? 0 : 1}
      />
      {editorMode === "ai" ? (
        <div>do stuff</div>
      ) : (
        <ManualChartOptions
          metrics={metrics}
          setMetrics={setMetrics}
          reportType={reportType}
          setReportType={setReportType}
        />
      )}
    </div>
  );
};
