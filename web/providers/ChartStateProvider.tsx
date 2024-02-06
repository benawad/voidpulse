import { ChartTimeRangeType, ChartType, ReportType } from "@voidpulse/api";
import moment, { Moment } from "moment";
import React, { useContext, useState } from "react";
import { Metric, MetricFilter } from "../src/app/chart/metric-selector/Metric";
import { genId } from "../src/app/utils/genId";
import { RouterOutput } from "../src/app/utils/trpc";

type ChartStateType = {
  title: string;
  description: string;
  reportType: ReportType;
  chartType: ChartType;
  timeRangeType: ChartTimeRangeType;
  from?: Moment | null;
  to?: Moment | null;
  metrics: Metric[];
  globalFilters: MetricFilter[];
  breakdowns: MetricFilter[];
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
    metrics: [],
    globalFilters: [],
    breakdowns: [],
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
      metrics: chart?.metrics.map((x) => ({ ...x, id: genId() })) || [],
      timeRangeType: chart?.timeRangeType || ChartTimeRangeType["30D"],
      from: chart?.from ? moment(chart.from) : null,
      to: chart?.to ? moment(chart.to) : null,
      globalFilters: [] as MetricFilter[],
      breakdowns: [] as MetricFilter[],
    };
  });

  return (
    <ChartStateContext.Provider value={chartState}>
      {children}
    </ChartStateContext.Provider>
  );
};

export const useChartStateContext = () => useContext(ChartStateContext);
