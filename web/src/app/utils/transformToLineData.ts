import {
  ChartType,
  DateHeader,
  LineChartGroupByTimeType,
  MetricMeasurement,
} from "@voidpulse/api";
import { RouterOutput } from "./trpc";
import { calcPercentageChange } from "./calcPercentChange";
import { TooltipData } from "../ui/charts/ChartTooltip";

export const transformLineData = ({
  datas,
  dateHeader,
  colorOrder,
  visibleDataMap,
  highlightedId,
  lineChartStyle,
  lineChartGroupByTimeType,
}: {
  datas: Extract<
    RouterOutput["getReport"]["datas"],
    { average_count: number }[]
  >;
  dateHeader: DateHeader[];
  lineChartStyle: any;
  colorOrder: string[];
  visibleDataMap?: Record<string, boolean> | null;
  lineChartGroupByTimeType: LineChartGroupByTimeType;
  highlightedId?: string | null;
}) => {
  const filteredData = datas.filter((d, i) => {
    if (!visibleDataMap) {
      return i < 10;
    }
    return visibleDataMap[d.id];
  });
  const datasets = filteredData.map((data, i) => {
    const col = colorOrder[i % colorOrder.length];
    return {
      ...lineChartStyle,
      borderWidth: data.id === highlightedId ? 4 : 2,
      borderColor: col,
      backgroundColor: colorOrder,
      pointHoverBackgroundColor: col,
      label: data.eventLabel,
      data: dateHeader.map((d) => data.data[d.lookupValue] || 0),
    };
  });

  return {
    data: {
      labels: dateHeader.map((d) => d.label),
      datasets,
    },
    getTooltipData: (datasetIndex: number, dataIndex: number): TooltipData => {
      const { eventLabel, breakdown, measurement } = filteredData[datasetIndex];
      const { borderColor, data } = datasets[datasetIndex];
      return {
        title: eventLabel,
        subtitle: typeof breakdown === "undefined" ? "" : "" + breakdown,
        dateString: dateHeader[dataIndex].fullLabel,
        label: {
          highlight: data[dataIndex].toLocaleString(),
          annotation: measurement
            ? {
                [MetricMeasurement.totalEvents]: "events",
                [MetricMeasurement.uniqueUsers]: "users",
              }[measurement]
            : "",
        },
        stripeColor: borderColor,
        percentChange:
          dataIndex && data[dataIndex - 1]
            ? {
                value: calcPercentageChange(
                  data[dataIndex - 1],
                  data[dataIndex]
                ),
                annotation: `from previous ${LineChartGroupByTimeType[lineChartGroupByTimeType].toString()}`,
              }
            : undefined,
      };
    },
  };
};
