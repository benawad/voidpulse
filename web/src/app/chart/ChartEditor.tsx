import React, { useState } from "react";
import { LineChart } from "../ui/charts/LineChart";
import { placeholderLineData } from "../ui/charts/PlaceholderChartData";
import Link from "next/link";
import { MetricSelector } from "./metric-selector/MetricSelector";
import { trpc } from "../utils/trpc";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { lineChartStyle } from "../ui/charts/ChartStyle";
import { FaPlus } from "react-icons/fa6";
import { LineSeparator } from "../ui/LineSeparator";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineFunnelPlot } from "react-icons/ai";
import { SlGraph } from "react-icons/sl";
import { BsBarChart } from "react-icons/bs";
import { LiaChartAreaSolid } from "react-icons/lia";
import { Metric, MetricBlock } from "./metric-selector/MetricBlock";
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

  const controlOptionsStyle =
    "accent-hover p-2 my-2 rounded-md flex items-center group justify-between text-primary-200 text-sm font-semibold";
  const plusIcon = (
    <div className="w-6 h-6 rounded-md mr-3">
      <FaPlus
        className="m-auto group-hover:fill-secondary-signature-100 h-full w-full"
        style={{ padding: 5 }}
        size={12}
      />
    </div>
  );

  const chartTypeButtonStyle =
    "accent-hover py-2 rounded-md w-full m-1 flex items-center bg-primary-800/50 flex flex-col text-xs text-primary-600";
  const chartTypeIconStyle = "w-8 h-8 rounded-md my-2 text-primary-400";

  return (
    <div>
      {/* Navigation that shows hierarchy of dashboards */}
      <div className="h-14 border-b border-primary-700 items-center flex">
        <Link href="/">
          <div className="mx-4 text-sm text-primary-500">Back to dashboard</div>
        </Link>
      </div>
      {/* View that houses editor and chart side by side */}
      <div className="flex grow w-full h-full">
        {/* Toolbar */}
        <div
          className="border-r p-4 bg-primary-900 border-primary-800"
          style={{ width: 400 }}
        >
          <div className="flex flex-row w-full justify-between">
            <div className={chartTypeButtonStyle}>
              <SlGraph className={chartTypeIconStyle} />
            </div>
            <div className={chartTypeButtonStyle}>
              <BsBarChart className={"-scale-x-100 " + chartTypeIconStyle} />
            </div>
            <div className={chartTypeButtonStyle}>
              <LiaChartAreaSolid
                className={"-scale-x-100 " + chartTypeIconStyle}
              />
            </div>
          </div>
          <div className={controlOptionsStyle}>Metrics {plusIcon}</div>
          {metrics.map((m, idx) => (
            <MetricBlock
              onEventNameChange={(name) => {
                setMetrics(
                  metrics.map((metric, i) =>
                    i === idx ? { ...metric, name } : metric
                  )
                );
              }}
              idx={idx}
              metric={m}
            />
          ))}
          <div className={controlOptionsStyle}>Filter {plusIcon}</div>
          <div className={controlOptionsStyle}>Breakdown {plusIcon}</div>
        </div>
        {/* Chart view panel */}
        <div className="w-full">
          {/* Just the chart */}
          <div className="p-12" style={{ minWidth: 800, minHeight: 500 }}>
            <h1 className="font-bold text-lg text-primary-100 px-2">
              Chart title
            </h1>
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
