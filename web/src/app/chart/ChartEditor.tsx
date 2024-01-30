import React from "react";
import { LineChart } from "../ui/charts/LineChart";
import { placeholderLineData } from "../ui/charts/PlaceholderChartData";
import Link from "next/link";
import { MetricSelector } from "./MetricSelector";
import { trpc } from "../utils/trpc";
import { useProjectContext } from "../../../providers/ProjectProvider";
import { lineChartStyle } from "../ui/charts/ChartStyle";
import { FaPlus } from "react-icons/fa6";
import { LineSeparator } from "../ui/LineSeparator";
interface ChartEditorProps {}

export const ChartEditor: React.FC<ChartEditorProps> = ({}) => {
  const [eventName, setEventName] = React.useState("");
  const project = useProjectContext();
  const { data, error } = trpc.getChartData.useQuery(
    {
      eventName,
      from: "2024-01-19 00:00:00",
      to: "2024-01-25 00:00:00",
      projectId: project.id,
    },
    { enabled: !!eventName }
  );

  console.log(eventName, data, error);
  const controlOptionsStyle =
    "accent-hover p-2 my-4 rounded-md flex items-center group justify-between";
  const plusIcon = (
    <div className="w-6 h-6 rounded-md mr-3">
      <FaPlus
        className="m-auto group-hover:fill-white h-full w-full"
        style={{ padding: 5 }}
        size={12}
      />
    </div>
  );

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
        <div className="border-r p-4 border-primary-700" style={{ width: 400 }}>
          <div className="subtext py-2">CUSTOMIZE MY CHART</div>

          <div className={controlOptionsStyle}>Metrics {plusIcon}</div>
          <MetricSelector
            eventName={eventName}
            onEventNameChange={setEventName}
          />
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
