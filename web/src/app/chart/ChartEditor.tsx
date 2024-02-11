import {
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
  RetentionNumFormat,
} from "@voidpulse/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
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
import {
  PiChartBar,
  PiChartDonut,
  PiChartLine,
  PiSuitcaseSimple,
} from "react-icons/pi";
import { WiDaySunny } from "react-icons/wi";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { BarChart } from "../ui/charts/BarChart";
import { HintCallout } from "../ui/HintCallout";
import { transformToBarChartData } from "../utils/transformToBarChartData";
import { transformRetentionToLineChartData } from "../utils/transformRetentionToLineChartData";
import { NoDataToDisplayVisual } from "./NoDataToDisplayVisual";
import { FunnelChart } from "../ui/charts/FunnelChart";
import { transformToFunnelChartData } from "../utils/transformToFunnelChartData";
interface ChartEditorProps {
  chart?: RouterOutput["getCharts"]["charts"][0];
}

type RetRow = Extract<
  RouterOutput["getReport"]["datas"][0],
  { averageRetentionByDay: any }
>;
type RetSubRow = {
  isSubrow: boolean;
  retentionByDay: Record<
    number,
    {
      cohort_date: string;
      days_after_cohort: number;
      retained_users: number;
      cohort_size: number;
      retained_users_percent: number;
      breakdown?: any;
    }
  >;
  cohortSize: number;
  dt: string;
};

export const ChartEditor: React.FC<ChartEditorProps> = ({ chart }) => {
  const [
    {
      metrics,
      chartType,
      retentionNumFormat,
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
  const [expandedDataRows, setExpandedDataRows] = useState<
    Record<string, boolean>
  >({});
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

  const { data, error } = trpc.getReport.useQuery(
    {
      metrics,
      breakdowns,
      globalFilters,
      timeRangeType,
      reportType,
      chartType,
      lineChartGroupByTimeType: lineChartGroupByTimeType || undefined,
      from: from ? dateToClickhouseDateString(from) : undefined,
      to: to ? dateToClickhouseDateString(to) : undefined,
      projectId: projectId,
    },
    {
      enabled:
        reportType === ReportType.retention
          ? metrics.length === 2
          : !!metrics.length,
    }
  );
  const retData = useMemo(() => {
    if (data?.reportType !== ReportType.retention) {
      return [];
    }

    if (Object.keys(expandedDataRows).length === 0) {
      return data.datas;
    }

    const retData = [] as Array<RetRow | RetSubRow>;
    for (const d of data.datas) {
      retData.push(d);
      if (!expandedDataRows[d.id]) {
        continue;
      }
      for (const [dt, { cohortSize, retentionByDay }] of Object.entries(
        d.data
      )) {
        retData.push({
          dt,
          isSubrow: true,
          cohortSize,
          retentionByDay,
        });
      }
    }
    return retData;
  }, [data, expandedDataRows]);
  const { board } = useFetchProjectBoards();
  const [highlightedRow, setHighlightedRow] = React.useState<string | null>(
    null
  );

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
              {/* Area for chart type and group by time */}
              <div className="mr-12 flex flex-row space-x-2">
                {reportType === ReportType.retention ? (
                  <div className="my-auto standard card shadow-lg">
                    <Dropdown
                      autoWidth
                      value={retentionNumFormat || RetentionNumFormat.percent}
                      opts={[
                        {
                          label: "Percent",
                          value: RetentionNumFormat.percent,
                          Icon: <WiDaySunny />,
                        },
                        {
                          label: "Raw count",
                          value: RetentionNumFormat.rawCount,
                          Icon: <PiSuitcaseSimple />,
                        },
                      ]}
                      onSelect={(value) => {
                        setState((prev) => ({
                          ...prev,
                          retentionNumFormat: value,
                        }));
                      }}
                    />
                  </div>
                ) : null}
                {reportType === ReportType.insight ? (
                  <>
                    {/* Group by time selector */}
                    <div className="my-auto standard card shadow-lg">
                      <Dropdown
                        autoWidth
                        value={
                          lineChartGroupByTimeType ||
                          LineChartGroupByTimeType.day
                        }
                        opts={[
                          {
                            label: "By day",
                            value: LineChartGroupByTimeType.day,
                            Icon: <WiDaySunny />,
                          },
                          {
                            label: "By week",
                            value: LineChartGroupByTimeType.week,
                            Icon: <PiSuitcaseSimple />,
                          },
                          {
                            label: "By month",
                            value: LineChartGroupByTimeType.month,
                            Icon: <MdOutlineCalendarMonth />,
                          },
                        ]}
                        onSelect={(value) => {
                          setState((prev) => ({
                            ...prev,
                            lineChartGroupByTimeType: value,
                          }));
                        }}
                      />
                    </div>
                    {/* Chart type selector */}
                    <div className="my-auto standard card shadow-lg">
                      <Dropdown
                        autoWidth
                        value={chartType || ChartType.line}
                        opts={[
                          {
                            label: "Line",
                            value: ChartType.line,
                            Icon: <PiChartLine />,
                          },
                          {
                            label: "Bar",
                            value: ChartType.bar,
                            Icon: <PiChartBar />,
                          },
                          {
                            label: "Donut",
                            value: ChartType.donut,
                            Icon: <PiChartDonut />,
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
                  </>
                ) : null}
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

            {/* CHART DISPLAYS HERE */}
            {data === null || !data?.datas.length ? (
              <NoDataToDisplayVisual />
            ) : null}
            {!data?.datas.length ? (
              <div>We couldn't find any data for this search</div>
            ) : null}
            {data?.reportType === ReportType.retention && data.datas.length ? (
              <LineChart
                disableAnimations
                yPercent={retentionNumFormat !== RetentionNumFormat.rawCount}
                data={transformRetentionToLineChartData(
                  data.datas,
                  data.retentionHeaders,
                  visibleDataMap,
                  highlightedRow,
                  retentionNumFormat
                )}
              />
            ) : null}

            {/* Insight line graph */}
            {data?.datas.length &&
            data?.reportType === ReportType.insight &&
            data.chartType === ChartType.line ? (
              <LineChart
                disableAnimations
                data={transformToLineChartData(
                  data.datas,
                  data.dateHeaders,
                  visibleDataMap,
                  highlightedRow
                )}
              />
            ) : null}

            {/* Insight donut */}
            {data?.datas.length &&
            data?.reportType === ReportType.insight &&
            data.chartType === ChartType.donut ? (
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

            {/* Funnel bar graph */}
            {data?.datas.length && reportType === ReportType.funnel ? (
              <div>
                <FunnelChart
                  data={transformToFunnelChartData(
                    data.datas,
                    visibleDataMap,
                    highlightedRow
                  )}
                />
              </div>
            ) : null}

            {/* Insight bar graph */}
            {data?.datas.length &&
            reportType === ReportType.insight &&
            data.chartType === ChartType.bar ? (
              <div>
                {breakdowns.length === 0 && metrics.length < 2 ? (
                  <HintCallout>
                    Bar charts are best used to show breakdowns, or compare
                    multiple datasets.
                  </HintCallout>
                ) : null}
                <BarChart
                  data={transformToBarChartData(
                    data.datas,
                    visibleDataMap,
                    highlightedRow
                  )}
                />
              </div>
            ) : null}
          </div>
          {/* Additional data at the bottom */}
          {data?.datas.length && data?.reportType === ReportType.retention ? (
            <ChartDataTable
              key={retentionNumFormat}
              datas={retData}
              highlightedRow={highlightedRow}
              setHighlightedRow={setHighlightedRow}
              expandedDataRows={expandedDataRows}
              setExpandedDataRows={setExpandedDataRows}
              stickyColumns={[
                {
                  id: "a",
                  header: breakdowns[0]?.propName || "Date",
                  size: 200,
                  accessorFn: (row: any) =>
                    row.isSubrow
                      ? row.dt
                      : breakdowns[0]?.propName
                      ? row.breakdown
                      : row.eventLabel,
                  meta: {
                    expandable: true,
                    checkbox: true,
                  },
                },
                {
                  id: "c",
                  header: "Total profiles",
                  size: 200,
                  accessorFn: (row: RetRow | RetSubRow) =>
                    row.cohortSize.toLocaleString(),
                },
              ]}
              mainColumns={
                data.retentionHeaders.map((retHeader, i) => {
                  return {
                    accessorFn: (row: RetRow | RetSubRow) => {
                      if ("isSubrow" in row) {
                        if (
                          retentionNumFormat === RetentionNumFormat.rawCount
                        ) {
                          return row.retentionByDay[i]?.retained_users || 0;
                        } else {
                          return (
                            (row.retentionByDay[i]?.retained_users_percent ||
                              0) + "%"
                          );
                        }
                      }
                      if (retentionNumFormat === RetentionNumFormat.rawCount) {
                        return row.averageRetentionByDay[i]?.avgRetained || 0;
                      } else {
                        return (
                          (row.averageRetentionByDay[i]?.avgRetainedPercent ||
                            0) + "%"
                        );
                      }
                    },
                    header: retHeader.label,
                    size: 100,
                  };
                }) || []
              }
            />
          ) : null}
          {/* Additional data at the bottom */}
          {data?.datas.length &&
          data?.reportType === ReportType.insight &&
          data.chartType === ChartType.line ? (
            <ChartDataTable
              datas={data.datas}
              highlightedRow={highlightedRow}
              setHighlightedRow={setHighlightedRow}
              stickyColumns={[
                {
                  id: "a",
                  header: "Event",
                  size: 200,
                  accessorFn: (row: any) => row.eventLabel,
                },
                ...(breakdowns[0]?.propName
                  ? [
                      {
                        id: "b",
                        header: breakdowns[0]?.propName,
                        size: 200,
                        accessorFn: (row: any) => row.breakdown,
                        meta: {
                          checkbox: true,
                        },
                      },
                    ]
                  : []),
                {
                  id: "c",
                  header: "Average",
                  size: 100,
                  accessorFn: (row: any) => row.average_count,
                },
              ]}
              mainColumns={
                data.dateHeaders.map((dateHeader) => {
                  return {
                    accessorFn: (row: any) => {
                      return row.data[dateHeader.lookupValue];
                    },
                    header: dateHeader.label,
                    size: 100,
                  };
                }) || []
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
