import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { Button } from "../ui/Button";
import { EditableTextField } from "../ui/EditableTextField";
import { LineChart } from "../ui/charts/LineChart";
import { transformToChartData } from "../utils/transformToChartData";
import { RouterOutput, trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { ChartEditorSidebar } from "./ChartEditorSidebar";
import { ChartDateRangePicker } from "./ChartDateRangePicker";
import {
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
} from "@voidpulse/api";
import { genId } from "../utils/genId";
import { Metric } from "./metric-selector/Metric";
import { useChartStateContext } from "../../../providers/ChartStateProvider";
import moment from "moment";
import { ChartDataTable } from "./data-table/ChartDataTable";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";
import { Dropdown } from "../ui/Dropdown";
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
      globalFilters: [],
      timeRangeType,
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
                      data: transformToChartData(
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
            {data?.datas.length ? (
              <LineChart
                disableAnimations
                data={transformToChartData(
                  data.datas,
                  data.dateHeaders,
                  visibleDataMap
                )}
              />
            ) : null}
          </div>
          {/* Additional data at the bottom */}
          {data?.datas.length ? (
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
