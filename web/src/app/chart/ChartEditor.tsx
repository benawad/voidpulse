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
import { ChartType, ReportType } from "@voidpulse/api";
import { genId } from "../utils/genId";
import { Metric } from "./metric-selector/Metric";
import { useChartStateContext } from "../../../providers/ChartStateProvider";
import moment from "moment";
interface ChartEditorProps {
  chart?: RouterOutput["getCharts"]["charts"][0];
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ chart }) => {
  const [{ metrics, chartType, reportType, title, description }, setState] =
    useChartStateContext();
  // @TODO: Decide if this variable should be housed here or in the ChartStateContext
  const [dateRangePicked, setDateRangePicked] = useState({
    startDate: moment(),
    endDate: moment().add(1, "days"),
  });
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
        <ChartEditorSidebar />
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
              <Button
                disabled={pendingCreateChart || pendingUpdateChart}
                onClick={async () => {
                  if (metrics.length && data) {
                    if (chart) {
                      updateChart({
                        id: chart.id,
                        projectId,
                        updateData: {
                          title,
                          description,
                          chartType,
                          reportType,
                          metrics,
                          data: transformToChartData(data.datas),
                        },
                      });
                    } else {
                      createChart({
                        title,
                        boardId,
                        description,
                        chartType,
                        reportType,
                        projectId,
                        metrics,
                        data: transformToChartData(data.datas),
                      });
                    }
                    router.push(`/`);
                  }
                }}
              >
                Save chart
              </Button>
            </div>
            <ChartDateRangePicker
              dateRangePicked={dateRangePicked}
              setDateRangePicked={setDateRangePicked}
            />
            {/* Chart  */}
            {data?.datas.length ? (
              <LineChart
                disableAnimations
                data={transformToChartData(data.datas)}
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
