import {
  ChartTimeRangeType,
  ChartType,
  EventCombination,
  LineChartGroupByTimeType,
  LtvType,
  LtvWindowType,
  ReportType,
  RetentionNumFormat,
} from "@voidpulse/api";
import moment, { Moment } from "moment";
import React, { useContext, useState } from "react";
import {
  Metric,
  MetricFilter,
} from "../src/app/p/[projectId]/chart/metric-selector/Metric";
import { RouterOutput } from "../src/app/utils/trpc";

type ChartStateType = {
  title: string;
  description: string;
  reportType: ReportType;
  chartType: ChartType;
  from?: Moment | null;
  to?: Moment | null;
  timeRangeType: ChartTimeRangeType;
  visibleDataMap?: Record<string, boolean> | null;
  lineChartGroupByTimeType?: LineChartGroupByTimeType | null;
  isOverTime?: boolean | null;
  metrics: Metric[];
  globalFilters: MetricFilter[];
  breakdowns: MetricFilter[];
  combinations: EventCombination[];
  retentionNumFormat?: RetentionNumFormat | null;
  ltvType?: LtvType | null;
  ltvWindowType?: LtvWindowType | null;
};

const ChartStateContext = React.createContext<
  [ChartStateType, React.Dispatch<React.SetStateAction<ChartStateType>>]
>([
  {
    title: "",
    description: "",
    reportType: ReportType.insight,
    chartType: ChartType.line,
    timeRangeType: ChartTimeRangeType["30D"],
    visibleDataMap: null,
    metrics: [],
    globalFilters: [],
    breakdowns: [],
    combinations: [],
    ltvType: null,
    ltvWindowType: null,
  },
  () => {},
]);

export const ChartStateProvider: React.FC<
  React.PropsWithChildren<{
    chart?: RouterOutput["getCharts"]["charts"][0] | null;
  }>
> = ({ children, chart }) => {
  const chartState = useState<ChartStateType>(() => {
    return {
      title: chart?.title || "",
      description: chart?.description || "",
      reportType: chart?.reportType || ReportType.insight,
      chartType: chart?.chartType || ChartType.line,
      metrics: chart?.metrics || [],
      visibleDataMap: null,
      ltvType: chart?.ltvType,
      ltvWindowType: chart?.ltvWindowType,
      lineChartGroupByTimeType: chart?.lineChartGroupByTimeType,
      isOverTime:
        chart?.data && "isOverTime" in chart.data
          ? chart?.data.isOverTime
          : false,
      timeRangeType: chart?.timeRangeType || ChartTimeRangeType["30D"],
      retentionNumFormat: chart?.retentionNumFormat,
      from: chart?.from ? moment(chart.from) : null,
      to: chart?.to ? moment(chart.to) : null,
      globalFilters: chart?.globalFilters || ([] as MetricFilter[]),
      breakdowns: chart?.breakdowns || ([] as MetricFilter[]),
      combinations: chart?.combinations || ([] as EventCombination[]),
    };
  });

  return (
    <ChartStateContext.Provider value={chartState}>
      {children}
    </ChartStateContext.Provider>
  );
};

export const useChartStateContext = () => useContext(ChartStateContext);
