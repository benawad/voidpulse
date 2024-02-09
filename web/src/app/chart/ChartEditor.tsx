import {
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
} from "@voidpulse/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useChartStateContext } from "../../../providers/ChartStateProvider";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
import { EditableTextField } from "../ui/EditableTextField";
import { LineChart } from "../ui/charts/LineChart";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";
import { transformToLineChartData } from "../utils/transformToLineChartData";
import { RouterOutput, trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { ChartDateRangePicker } from "./ChartDateRangePicker";
import { ChartEditorSidebar } from "./ChartEditorSidebar";
import { ChartDataTable } from "./data-table/ChartDataTable";
import { DonutChart } from "../ui/charts/DonutChart";
import { Doughnut } from "react-chartjs-2";
import { donutChartStyle } from "../ui/charts/ChartStyle";
interface ChartEditorProps {
  chart?: RouterOutput["getCharts"]["charts"][0];
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ chart }) => {
  const [
    {
      metrics,
      chartType,
      breakdowns,
      reportType,
      title,
      description,
      lineChartGroupByTimeType,
      from,
      to,
      timeRangeType,
      visibleDataMap,
      globalFilters,
    },
    setState,
  ] = useChartStateContext();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { projectId, boardId } = useProjectBoardContext();
  const { mutateAsync: createChart, isPending: pendingCreateChart } =
    trpc.createChart.useMutation({
      onSuccess: (data) => {
        utils.getCharts.setData({ boardId, projectId }, (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              charts: [...oldData.charts, data.chart],
            };
          }
          return oldData;
        });
      },
    });
  const { mutateAsync: updateChart, isPending: pendingUpdateChart } =
    trpc.updateChart.useMutation({
      onSuccess: (data) => {
        utils.getCharts.setData({ boardId, projectId }, (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              charts: oldData.charts.map((x) =>
                x.id === data.chart.id ? data.chart : x
              ),
            };
          }
          return oldData;
        });
      },
    });

  const { data, error } = trpc.getInsight.useQuery(
    {
      metrics,
      breakdowns,
      globalFilters,
      timeRangeType,
      chartType,
      lineChartGroupByTimeType: lineChartGroupByTimeType || undefined,
      from: from ? dateToClickhouseDateString(from) : undefined,
      to: to ? dateToClickhouseDateString(to) : undefined,
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
      <div className="flex w-full h-full">
        <ChartEditorSidebar />
        {/* Main section of the chart view */}
        <div className="flex-1 overflow-x-auto">
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
                      onDone={(text) =>
                        setState((prev) => ({ ...prev, title: text }))
                      }
                    />
                  </h1>
                </div>
                <div className="flex">
                  <div className="text-xs subtext px-1 rounded-md">
                    <EditableTextField
                      onDone={(text) =>
                        setState((prev) => ({ ...prev, description: text }))
                      }
                      text={description}
                      placeholder="Add description..."
                    />
                  </div>
                </div>
              </div>
              <div className="mr-12">
                <div className="my-auto">
                  <Dropdown
                    autoWidth
                    value={
                      lineChartGroupByTimeType || LineChartGroupByTimeType.day
                    }
                    opts={[
                      { label: "Day", value: LineChartGroupByTimeType.day },
                      { label: "Week", value: LineChartGroupByTimeType.week },
                      { label: "Month", value: LineChartGroupByTimeType.month },
                    ]}
                    onSelect={(value) => {
                      setState((prev) => ({
                        ...prev,
                        lineChartGroupByTimeType: value,
                      }));
                    }}
                  />
                </div>
                <div className="my-auto">
                  <Dropdown
                    autoWidth
                    value={chartType || ChartType.line}
                    opts={[
                      {
                        label: "Line",
                        value: ChartType.line,
                      },
                      {
                        label: "Bar",
                        value: ChartType.bar,
                      },
                      {
                        label: "Donut",
                        value: ChartType.donut,
                      },
                    ]}
                    onSelect={(value) => {
                      setState((prev) => ({
                        ...prev,
                        chartType: value,
                      }));
                    }}
                  />
                </div>
              </div>
              <Button
                disabled={pendingCreateChart || pendingUpdateChart}
                onClick={async () => {
                  if (metrics.length && data) {
                    const fields = {
                      title,
                      description,
                      chartType,
                      reportType,
                      metrics,
                      lineChartGroupByTimeType:
                        lineChartGroupByTimeType || undefined,
                      timeRangeType,
                      from: from?.toISOString(),
                      to: to?.toISOString(),
                      visibleDataMap,
                      data: transformToLineChartData(
                        data.datas,
                        data.dateHeaders,
                        visibleDataMap
                      ),
                    };
                    if (chart) {
                      updateChart({
                        id: chart.id,
                        projectId,
                        updateData: fields,
                      });
                    } else {
                      createChart({
                        projectId,
                        boardId,
                        ...fields,
                      });
                    }
                    router.push(`/`);
                  }
                }}
              >
                Save chart
              </Button>
            </div>
            <ChartDateRangePicker />
            {/* Chart  */}
            {data?.datas.length && data.chartType === ChartType.line ? (
              <LineChart
                disableAnimations
                data={transformToLineChartData(
                  data.datas,
                  data.dateHeaders,
                  visibleDataMap
                )}
              />
            ) : null}
            {data?.datas.length && data.chartType === ChartType.donut ? (
              <div>
                <DonutChart
                  data={{
                    labels: data.datas.map(
                      (x) => "" + (x.breakdown ?? x.eventLabel)
                    ),
                    datasets: [
                      {
                        ...donutChartStyle,
                        label: data.datas[0].eventLabel,
                        data: data.datas.map((x) => x.value),
                      },
                    ],
                  }}
                />
              </div>
            ) : null}
          </div>
          {/* Additional data at the bottom */}
          {data?.datas.length && data.chartType === ChartType.line ? (
            <ChartDataTable
              dateHeaders={data.dateHeaders}
              breakdownPropName={breakdowns[0]?.propName}
              datas={data.datas}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
