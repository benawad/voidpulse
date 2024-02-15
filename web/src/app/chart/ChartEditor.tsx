import {
  BreakdownType,
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
  RetentionNumFormat,
} from "@voidpulse/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { MdOutlineCalendarMonth } from "react-icons/md";
import {
  PiChartBar,
  PiChartDonut,
  PiChartLine,
  PiSuitcaseSimple,
} from "react-icons/pi";
import { WiDaySunny } from "react-icons/wi";
import { useChartStateContext } from "../../../providers/ChartStateProvider";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { useColorOrder } from "../themes/useColorOrder";
import { useChartStyle } from "../themes/useChartStyle";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
import { EditableTextField } from "../ui/EditableTextField";
import { HintCallout } from "../ui/HintCallout";
import { BarChart } from "../ui/charts/BarChart";
import { DonutChart } from "../ui/charts/DonutChart";
import { FunnelChart } from "../ui/charts/FunnelChart";
import { LineChart } from "../ui/charts/LineChart";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";
import { transformRetentionData } from "../utils/transformRetentionData";
import { transformBarData } from "../utils/transformBarData";
import { transformFunnelChartData } from "../utils/transformFunnelData";
import { transformLineData } from "../utils/transformToLineData";
import { RouterOutput, trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { ChartDateRangePicker } from "./ChartDateRangePicker";
import { ChartEditorSidebar } from "./ChartEditorSidebar";
import { NoDataToDisplayVisual } from "./NoDataToDisplayVisual";
import { ChartDataTable } from "./data-table/ChartDataTable";
import { useCurrTheme } from "../themes/useCurrTheme";
import { transformDonutData } from "../utils/transformDonutData";
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
      breakdown?: BreakdownType;
    }
  >;
  cohortSize: number;
  dt: string;
};

export const ChartEditor: React.FC<ChartEditorProps> = ({ chart }) => {
  const chartStyle = useChartStyle();
  const colorOrder = useColorOrder();
  const { theme } = useCurrTheme();
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

  const { data, isLoading, error } = trpc.getReport.useQuery(
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
  const [highlightedRowId, setHighlightedRow] = React.useState<string | null>(
    null
  );
  const funnelData = useMemo(() => {
    if (data?.reportType !== ReportType.funnel) {
      return {
        data: {
          labels: [],
          datasets: [],
        },
        getTooltipData: () => ({}),
      };
    }

    return transformFunnelChartData({
      datas: data.datas,
      labels: data.labels,
      colorOrder,
      visibleDataMap,
      highlightedId: highlightedRowId,
    });
  }, [data, visibleDataMap, highlightedRowId, colorOrder]);

  const dataStr = useMemo(() => {
    return !data
      ? ""
      : JSON.stringify({
          ...data,
          reportType: ReportType[data.reportType].toString(),
          chartType:
            data.reportType === ReportType.insight
              ? ChartType[data.chartType].toString()
              : "",
        });
  }, [data]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation bar that shows hierarchy of dashboards */}
      <div className="h-14 border-b border-primary-700 items-center flex">
        <Link href="/">
          <div className="mx-4 text-sm text-primary-500">
            {board?.title || "Dashboard"}
          </div>
        </Link>
      </div>
      {/* View that houses editor and chart side by side */}
      <div className="flex w-full flex-1 overflow-hidden">
        <ChartEditorSidebar dataStr={dataStr} />
        {/* Main section of the chart view */}
        <div
          className="flex-1 overflow-x-auto overflow-y-auto"
          style={{ height: "calc(100vh - 100px)" }}
        >
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
                      retentionNumFormat,
                      breakdowns,
                      globalFilters,
                      data: data as any,
                    };
                    if (chart) {
                      await updateChart({
                        id: chart.id,
                        projectId,
                        updateData: fields,
                      });
                    } else {
                      await createChart({
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
            {metrics.length && !isLoading && !data?.datas.length ? (
              <>
                <NoDataToDisplayVisual />
                <div>We couldn't find any data for this search</div>
              </>
            ) : null}
            {data?.reportType === ReportType.retention && data.datas.length ? (
              <LineChart
                disableAnimations
                yPercent={retentionNumFormat !== RetentionNumFormat.rawCount}
                {...transformRetentionData({
                  datas: data.datas,
                  colorOrder,
                  retHeaders: data.retentionHeaders,
                  visibleDataMap,
                  highlightedId: highlightedRowId,
                  retentionNumFormat,
                  lineChartStyle: chartStyle.line,
                })}
              />
            ) : null}

            {/* Insight line graph */}
            {data?.datas.length &&
            data?.reportType === ReportType.insight &&
            data.chartType === ChartType.line ? (
              <LineChart
                disableAnimations
                {...transformLineData({
                  datas: data.datas,
                  dateHeader: data.dateHeaders,
                  colorOrder,
                  visibleDataMap,
                  highlightedId: highlightedRowId,
                  lineChartStyle: chartStyle.line,
                  lineChartGroupByTimeType:
                    lineChartGroupByTimeType || LineChartGroupByTimeType.day,
                })}
              />
            ) : null}

            {/* Insight donut */}
            {data?.datas.length &&
            data?.reportType === ReportType.insight &&
            data.chartType === ChartType.donut ? (
              <div>
                <DonutChart
                  {...transformDonutData({
                    datas: data.datas,
                    visibleDataMap,
                    highlightedId: highlightedRowId,
                    donutChartStyle: chartStyle.donut,
                  })}
                />
              </div>
            ) : null}

            {/* Funnel bar graph */}
            {data?.datas.length && data.reportType === ReportType.funnel ? (
              <div>
                <FunnelChart {...funnelData} />
              </div>
            ) : null}

            {/* Insight bar graph */}
            {data?.datas.length &&
            data.reportType === ReportType.insight &&
            data.chartType === ChartType.bar ? (
              <div>
                {breakdowns.length === 0 && metrics.length < 2 ? (
                  <HintCallout>
                    Bar charts are best used to show breakdowns, or compare
                    multiple datasets.
                  </HintCallout>
                ) : null}
                <BarChart
                  {...transformBarData({
                    datas: data.datas,
                    visibleDataMap,
                    highlightedId: highlightedRowId,
                    barChartStyle: chartStyle.bar,
                  })}
                />
              </div>
            ) : null}
          </div>
          {/* Additional data at the bottom */}
          {data?.datas.length && data?.reportType === ReportType.retention ? (
            <ChartDataTable
              key={retentionNumFormat}
              datas={retData}
              highlightedRow={highlightedRowId}
              setHighlightedRow={setHighlightedRow}
              expandedDataRows={expandedDataRows}
              setExpandedDataRows={setExpandedDataRows}
              stickyColumns={[
                {
                  id: "a",
                  header: breakdowns[0]?.prop.value || "Date",
                  size: 200,
                  accessorFn: (row: any) =>
                    row.isSubrow
                      ? row.dt
                      : breakdowns[0]?.prop.value
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
              highlightedRow={highlightedRowId}
              setHighlightedRow={setHighlightedRow}
              stickyColumns={[
                {
                  id: "a",
                  header: "Event",
                  size: 200,
                  accessorFn: (row: any) => row.eventLabel,
                },
                ...(breakdowns[0]?.prop.value
                  ? [
                      {
                        id: "b",
                        header: breakdowns[0]?.prop.value,
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
                  accessorFn: (row: any) => row.average_count.toLocaleString(),
                },
              ]}
              mainColumns={
                data.dateHeaders.map((dateHeader) => {
                  return {
                    accessorFn: (row: any) => {
                      return row.data[dateHeader.lookupValue].toLocaleString();
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
