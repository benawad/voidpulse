import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { Button } from "../ui/Button";
import { EditableTextField } from "../ui/EditableTextField";
import { LineChart } from "../ui/charts/LineChart";
import { transformToChartData } from "../utils/transformToChartData";
import { trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { ChartEditorSidebar } from "./ChartEditorSidebar";
import { DateRangePicker } from "./DateRangePicker";
import { Metric } from "./metric-selector/MetricBlock";
interface ChartEditorProps {}

export const ChartEditor: React.FC<ChartEditorProps> = ({}) => {
  const router = useRouter();
  const { mutateAsync: createChart, isPending: pendingCreateChart } =
    trpc.createChart.useMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const { projectId, boardId } = useProjectBoardContext();
  const { data, error } = trpc.getInsight.useQuery(
    {
      metrics,
      breakdowns: [],
      globalFilters: [],
      from: "2024-01-19 00:00:00",
      to: "2024-01-25 00:00:00",
      projectId: projectId,
    },
    { enabled: !!metrics.length }
  );
  const { board } = useFetchProjectBoards();

  return (
    <div>
      {/* Navigation bar that shows hierarchy of dashboards */}
      <div className="h-14 border-b border-primary-700 items-center flex">
        <Link href="/">
          <div className="mx-4 text-sm text-primary-500">
            {board?.title || "Dashboard"}
          </div>
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
            <div className="flex">
              <div className="flex-1">
                <div className="flex mb-1">
                  <h1 className="font-bold text-2xl text-primary-100">
                    <EditableTextField
                      placeholder="Chart title"
                      text={title}
                      onDone={setTitle}
                    />
                  </h1>
                </div>
                <div className="flex">
                  <div className="text-xs subtext px-1 rounded-md">
                    <EditableTextField
                      onDone={setDescription}
                      text={description}
                      placeholder="Add description..."
                    />
                  </div>
                </div>
              </div>
              <Button
                disabled={pendingCreateChart}
                onClick={() => {
                  if (metrics.length && data) {
                    createChart({
                      title,
                      boardId,
                      description,
                      projectId,
                      metrics,
                      data: transformToChartData(data.datas),
                    }).then(() => {
                      router.push(`/`);
                    });
                  }
                }}
              >
                Save
              </Button>
            </div>
            <DateRangePicker />
            {/* Chart  */}
            {data?.datas.length ? (
              <LineChart data={transformToChartData(data.datas)} />
            ) : null}
          </div>
          {/* Additional data at the bottom */}
          <div className="bg-primary-600">Data at the bottom</div>
        </div>
      </div>
    </div>
  );
};
