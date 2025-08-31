import {
  BreakdownType,
  ChartType,
  LineChartGroupByTimeType,
  LtvType,
  LtvWindowType,
  ReportType,
  RetentionNumFormat,
} from "@voidpulse/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineCalendarMonth, MdWindow } from "react-icons/md";
import {
  PiChartBar,
  PiChartDonut,
  PiChartLine,
  PiGraph,
  PiLineSegment,
  PiMoney,
  PiPercent,
  PiSuitcaseSimple,
  PiUsers,
} from "react-icons/pi";
import { WiDaySunny } from "react-icons/wi";
import { useChartStateContext } from "../../../../../providers/ChartStateProvider";
import { useProjectBoardContext } from "../../../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../../../stores/useLastSelectedProjectBoardStore";
import { useChartStyle } from "../../../themes/useChartStyle";
import { useColorOrder } from "../../../themes/useColorOrder";
import { Button } from "../../../ui/Button";
import { Dropdown } from "../../../ui/Dropdown";
import { EditableTextField } from "../../../ui/EditableTextField";
import { HintCallout } from "../../../ui/HintCallout";
import { BarChart } from "../../../ui/charts/BarChart";
import { DonutChart } from "../../../ui/charts/DonutChart";
import { FunnelChart } from "../../../ui/charts/FunnelChart";
import { LineChart } from "../../../ui/charts/LineChart";
import { dateToClickhouseDateString } from "../../../utils/dateToClickhouseDateString";
import { transformBarData } from "../../../utils/transformBarData";
import { transformDonutData } from "../../../utils/transformDonutData";
import { transformFunnelChartData } from "../../../utils/transformFunnelData";
import { transformRetentionData } from "../../../utils/transformRetentionData";
import { transformLineData } from "../../../utils/transformLineData";
import { RouterOutput, trpc } from "../../../utils/trpc";
import { useFetchProjectBoards } from "../../../utils/useFetchProjectBoards";
import { ChartDateRangePicker } from "./ChartDateRangePicker";
import { ChartEditorSidebar } from "./ChartEditorSidebar";
import { NoDataToDisplayVisual } from "./NoDataToDisplayVisual";
import { ChartDataTable } from "./data-table/ChartDataTable";
import moment from "moment";
import { msToDurationString } from "../../../utils/msToDurationString";
import { RiWindowLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { FiCopy } from "react-icons/fi";
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const chartStyle = useChartStyle();
  const colorOrder = useColorOrder();
  const { lastProjectId } = useLastSelectedProjectBoardStore();
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
      ltvType,
      ltvWindowType,
      globalFilters,
      combinations,
      isOverTime,
    },
    setState,
  ] = useChartStateContext();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { projectId, boardId } = useProjectBoardContext();
  const [expandedDataRows, setExpandedDataRows] = useState<
    Record<string, boolean>
  >({});

  const getReportVars = {
    metrics,
    breakdowns,
    globalFilters,
    timeRangeType,
    reportType,
    ltvType,
    ltvWindowType,
    chartType,
    combinations,
    lineChartGroupByTimeType: lineChartGroupByTimeType || undefined,
    from: from ? dateToClickhouseDateString(from) : undefined,
    to: to ? dateToClickhouseDateString(to) : undefined,
    projectId: projectId,
    isOverTime,
  };
  const { data, isLoading } = trpc.getReport.useQuery(getReportVars, {
    enabled:
      reportType === ReportType.retention || reportType === ReportType.ltv
        ? metrics.length === 2
        : !!metrics.length,
  });
  const { mutateAsync: createChart, isPending: pendingCreateChart } =
    trpc.createChart.useMutation({
      onSuccess: (createChartData, vars) => {
        utils.getCharts.setData({ boardId, projectId }, (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              charts: [...oldData.charts, createChartData.chart],
            };
          }
          return oldData;
        });
        utils.getBoards.setData({ projectId: lastProjectId }, (old) => {
          if (!old) {
            return old;
          }

          return {
            boards: old.boards.map((b) =>
              b.id === boardId ? createChartData.board : b
            ),
          };
        });
      },
    });
  const { mutateAsync: updateChart, isPending: pendingUpdateChart } =
    trpc.updateChart.useMutation({
      onSuccess: (updateChartData) => {
        utils.getCharts.setData({ boardId, projectId }, (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              charts: oldData.charts.map((x) =>
                x.id === updateChartData.chart.id ? updateChartData.chart : x
              ),
            };
          }
          return oldData;
        });
      },
    });

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
  const { board, project } = useFetchProjectBoards();
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

    return data.isOverTime
      ? transformLineData({
          datas: data.datas,
          dateHeader: data.dateHeaders,
          colorOrder,
          visibleDataMap,
          highlightedId: highlightedRowId,
          lineChartStyle: chartStyle.line,
          lineChartGroupByTimeType:
            lineChartGroupByTimeType || LineChartGroupByTimeType.day,
          numMetrics: metrics.length,
          isPercentage: true,
        })
      : transformFunnelChartData({
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

  // Helper to build query string for querySheet
  function buildQuerySheetUrl() {
    if (!project?.queryApiKey) return "";
    const params: Record<string, any> = {
      ...getReportVars,
      queryApiKey: project.queryApiKey,
    };
    // Serialize arrays/objects as JSON strings
    const keysToJson = [
      "metrics",
      "breakdowns",
      "globalFilters",
      "combinations",
    ];
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (keysToJson.includes(key)) {
        searchParams.set(key, JSON.stringify(value));
      } else {
        searchParams.set(key, String(value));
      }
    }
    // Use NEXT_PUBLIC_API_URL or fallback to window.location.origin
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${baseUrl.replace(/\/$/, "")}/query?${searchParams.toString()}`;
  }

  return (
    <>
      {/* Navigation bar that shows hierarchy of dashboards */}
      <div className="h-14 border-b border-primary-700 items-center flex">
        <Link href={`/p/${projectId}`}>
          <div className="mx-4 text-sm text-primary-500">
            {board?.title || "Dashboard"}
          </div>
        </Link>
      </div>
      {/* View that houses editor and chart side by side */}
      <div className="flex w-full flex-1 overflow-auto">
        <ChartEditorSidebar dataStr={dataStr} />
        {/* Main section of the chart view */}
        <div className="flex-1 h-full overflow-auto" ref={chartContainerRef}>
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
                {reportType === ReportType.funnel ? (
                  <div className="my-auto standard card shadow-lg">
                    <Dropdown
                      autoWidth
                      value={isOverTime || false}
                      opts={[
                        {
                          label: "Over time",
                          value: true,
                          Icon: <PiLineSegment />,
                        },
                        {
                          label: "Conversion",
                          value: false,
                          Icon: <PiPercent />,
                        },
                      ]}
                      onSelect={(value) => {
                        setState((prev) => ({
                          ...prev,
                          isOverTime: value,
                        }));
                      }}
                    />
                  </div>
                ) : null}
                {reportType === ReportType.insight ||
                reportType === ReportType.ltv ||
                isOverTime ? (
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
                  </>
                ) : null}
                {reportType === ReportType.insight ? (
                  <>
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
                {reportType === ReportType.ltv ||
                reportType === ReportType.insight ? (
                  <>
                    {/* Chart type selector */}
                    {reportType === ReportType.ltv ? (
                      <div className="my-auto standard card shadow-lg">
                        <Dropdown
                          autoWidth
                          value={ltvType || LtvType.payingUsers}
                          opts={[
                            {
                              label: "Paying users",
                              value: LtvType.payingUsers,
                              Icon: <PiMoney />,
                            },
                            {
                              label: "All users",
                              value: LtvType.allUsers,
                              Icon: <PiUsers />,
                            },
                          ]}
                          onSelect={(value) => {
                            setState((prev) => ({
                              ...prev,
                              ltvType: value,
                            }));
                          }}
                        />
                      </div>
                    ) : null}
                    {/* LTV window */}
                    <div className="my-auto standard card shadow-lg">
                      <Dropdown
                        autoWidth
                        value={
                          ltvWindowType ||
                          (reportType === ReportType.ltv
                            ? LtvWindowType.AllTime
                            : LtvWindowType.NoWindow)
                        }
                        opts={[
                          {
                            label: "No window",
                            value: LtvWindowType.NoWindow,
                            Icon: <MdWindow />,
                          },
                          {
                            label: "7 days",
                            value: LtvWindowType.d7,
                            Icon: <MdWindow />,
                          },
                          {
                            label: "30 days",
                            value: LtvWindowType.d30,
                            Icon: <MdWindow />,
                          },
                          {
                            label: "90 days",
                            value: LtvWindowType.d90,
                            Icon: <MdWindow />,
                          },
                          {
                            label: "All time",
                            value: LtvWindowType.AllTime,
                            Icon: <MdWindow />,
                          },
                        ]}
                        onSelect={(value) => {
                          setState((prev) => ({
                            ...prev,
                            ltvWindowType: value,
                          }));
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </div>
              {/* Save and Copy Link buttons */}
              <div className="flex flex-row space-x-2 items-center">
                <Button
                  loading={pendingCreateChart || pendingUpdateChart}
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
                        ltvType,
                        ltvWindowType,
                        combinations,
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
                          boardIdx: parseInt(searchParams.get("idx") || "0"),
                          ...fields,
                        });
                      }
                      router.push(`/p/${projectId}`);
                    }
                  }}
                >
                  Save chart
                </Button>
                <Button
                  type="button"
                  buttonType="neutral"
                  onClick={async () => {
                    const url = buildQuerySheetUrl();
                    if (!url) {
                      toast.error("No query API key available");
                      return;
                    }
                    await navigator.clipboard.writeText(url);
                    toast.success("Query link copied to clipboard!");
                  }}
                  title="Copy query link to clipboard"
                >
                  <FiCopy className="inline mr-2" /> Copy Query Link
                </Button>
              </div>
            </div>
            <ChartDateRangePicker />

            {data?.computedAt ? (
              <div className="text-xs text-primary-400">
                Computed{" "}
                {msToDurationString(
                  new Date().getTime() - new Date(data.computedAt).getTime()
                )}{" "}
                ago
                <button
                  onClick={async () => {
                    const x = await utils.getReport.fetch({
                      ...getReportVars,
                      noCache: true,
                    });
                    utils.getReport.setData(getReportVars, x);
                  }}
                  className="text-accent-100 ml-1"
                >
                  Refresh
                </button>
              </div>
            ) : null}

            {/* CHART DISPLAYS HERE */}
            {metrics.length && !isLoading && !data?.datas.length ? (
              <div className="flex flex-col justify-center w-full items-center mt-8">
                <NoDataToDisplayVisual size={300} />
              </div>
            ) : null}
            <div className="w-full" style={{ height: 400 }}>
              {data?.reportType === ReportType.retention &&
              data.datas.length ? (
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
              ((data?.reportType === ReportType.insight &&
                data.chartType === ChartType.line) ||
                data?.reportType === ReportType.ltv) ? (
                <LineChart
                  disableAnimations
                  {...transformLineData({
                    numMetrics: metrics.length,
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
                <div style={{ height: 400 }} className="w-full">
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
                data.isOverTime ? (
                  <LineChart yPercent disableAnimations {...funnelData} />
                ) : (
                  <div className="mt-4">
                    <FunnelChart {...funnelData} />
                  </div>
                )
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
          </div>
          {/* Additional data at the bottom */}
          {data?.datas.length && data?.reportType === ReportType.retention ? (
            <ChartDataTable
              key={retentionNumFormat}
              datas={retData}
              highlightedRow={""}
              setHighlightedRow={() => {}}
              expandedDataRows={expandedDataRows}
              setExpandedDataRows={setExpandedDataRows}
              chartContainerRef={chartContainerRef}
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
              mainBgs={data.retentionHeaders.map((retHeader, i) => {
                return {
                  getBgColor: (row: any) => {
                    let percent = 0;
                    if ("isSubrow" in row) {
                      if (moment(row.dt).add(i, "day").isAfter(moment())) {
                        return undefined;
                      }
                      percent =
                        row.retentionByDay[i]?.retained_users_percent || 0;
                    } else {
                      percent =
                        row.averageRetentionByDay[i]?.avgRetainedPercent || 0;
                    }
                    percent /= 10;
                    percent = Math.ceil(percent);
                    percent /= 10;

                    return `rgb(var(--accent-100) / ${percent})`;
                  },
                };
              })}
              mainColumns={
                data.retentionHeaders.map((retHeader, i) => {
                  return {
                    accessorFn: (row: RetRow | RetSubRow) => {
                      if ("isSubrow" in row) {
                        if (moment(row.dt).add(i, "day").isAfter(moment())) {
                          return null;
                        }
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
          ((data?.reportType === ReportType.insight &&
            data.chartType === ChartType.line) ||
            ("isOverTime" in data && data.isOverTime) ||
            data?.reportType === ReportType.ltv) ? (
            <ChartDataTable
              datas={data.datas}
              chartContainerRef={chartContainerRef}
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
                  accessorFn: (row: any) => {
                    if (data.reportType === ReportType.funnel) {
                      return row.average_count.toLocaleString() + "%";
                    }
                    return row.average_count.toLocaleString();
                  },
                },
              ]}
              mainColumns={
                data.dateHeaders.map((dateHeader) => {
                  return {
                    accessorFn: (row: any) => {
                      if (data.reportType === ReportType.funnel) {
                        return (
                          row.data[dateHeader.lookupValue].toLocaleString() +
                          "%"
                        );
                      }
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
    </>
  );
};
