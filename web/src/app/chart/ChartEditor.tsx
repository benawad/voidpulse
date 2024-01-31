import React, { useState } from "react";
import { LineChart } from "../ui/charts/LineChart";
import { placeholderLineData } from "../ui/charts/PlaceholderChartData";
import Link from "next/link";
import { MetricSelector } from "./metric-selector/MetricSelector";
import { trpc } from "../utils/trpc";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { lineChartStyle } from "../ui/charts/ChartStyle";
import { Metric } from "./metric-selector/MetricBlock";
import { DateRangePicker } from "./DateRangePicker";
import { ChartEditorSidebar } from "./ChartEditorSidebar";
import { EditableTextField } from "../ui/EditableTextField";
interface ChartEditorProps {}

export const ChartEditor: React.FC<ChartEditorProps> = ({}) => {
  const [metrics, setMetrics] = useState<(Metric | null)[]>([null]);
  const [eventName, setEventName] = React.useState("");
  const { projectId } = useProjectBoardContext();
  const { data, error } = trpc.getInsight.useQuery(
    {
      eventName,
      from: "2024-01-19 00:00:00",
      to: "2024-01-25 00:00:00",
      projectId: projectId,
    },
    { enabled: !!eventName }
  );

  return (
    <div>
      {/* Navigation bar that shows hierarchy of dashboards */}
      <div className="h-14 border-b border-primary-700 items-center flex">
        <Link href="/">
          <div className="mx-4 text-sm text-primary-500">Back to dashboard</div>
        </Link>
      </div>
      {/* View that houses editor and chart side by side */}
      <div className="flex grow w-full h-full">
        <ChartEditorSidebar metrics={metrics} setMetrics={setMetrics} />
        {/* Main section of the chart view */}
        <div className="w-full">
          {/* Div that stacks the chart and data at the bottom */}
          <div className="p-12" style={{ minWidth: 800, minHeight: 500 }}>
            {/* Title and description */}
            <div className="flex mb-1">
              <h1 className="font-bold text-2xl text-primary-100">
                <EditableTextField text={"Chart Title"} onDone={() => {}} />
              </h1>
            </div>
            <div className="flex">
              <div className="text-xs subtext px-1 rounded-md">
                <EditableTextField
                  onDone={() => {}}
                  text={"Add description..."}
                />
              </div>
            </div>
            <DateRangePicker />
            {/* Chart  */}
            {eventName && data?.data.length ? (
              <LineChart
                data={{
                  labels: data.data.map((d) => d.day.split(" ")[0]),
                  datasets: [
                    {
                      ...lineChartStyle,
                      label: "My First Dataset",
                      data: data.data.map((d) => d.count),
                    },
                  ],
                }}
              />
            ) : null}
          </div>
          {/* Additional data at the bottom */}
          <div className="bg-primary-600">Data at the bottom</div>
        </div>
      </div>
    </div>
  );
};
