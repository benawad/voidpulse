import React, { useContext, useMemo, useState } from "react";
import { RouterOutput } from "../src/app/utils/trpc";
import { ChartType, ReportType } from "@voidpulse/api";
import { Metric, MetricFilter } from "../src/app/chart/metric-selector/Metric";
import { genId } from "../src/app/utils/genId";

type ChartStateType = {
  title: string;
  description: string;
  reportType: ReportType;
  chartType: ChartType;
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
  const chartState = useState(() => {
    return {
      title: chart?.title || "",
      description: chart?.description || "",
      reportType: chart?.reportType || ReportType.insight,
      chartType: chart?.chartType || ChartType.line,
      metrics: chart?.metrics.map((x) => ({ ...x, id: genId() })) || [],
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
