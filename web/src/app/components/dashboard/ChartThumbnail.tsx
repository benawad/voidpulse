"use client";
import {
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
  RetentionNumFormat,
} from "@voidpulse/api";
import "chart.js/auto";
import Link from "next/link";
import React from "react";
import { LineChart } from "../../ui/charts/LineChart";
import { useColorOrder } from "../../themes/useColorOrder";
import { useChartStyle } from "../../themes/useChartStyle";
import { transformLineData } from "../../utils/transformToLineData";
import { RouterOutput } from "../../utils/trpc";
import { transformRetentionData } from "../../utils/transformRetentionData";
import { BarChart } from "../../ui/charts/BarChart";
import { transformBarData } from "../../utils/transformBarData";
import { DonutChart } from "../../ui/charts/DonutChart";
import { transformDonutData } from "../../utils/transformDonutData";
import { FunnelChart } from "../../ui/charts/FunnelChart";
import { transformFunnelChartData } from "../../utils/transformFunnelData";
import { RxDragHandleDots2 } from "react-icons/rx";

interface ChartThumbnailProps {
  dragRef: any;
  chart: RouterOutput["getCharts"]["charts"][0];
}

export const ChartThumbnail: React.FC<ChartThumbnailProps> = ({
  chart,
  dragRef,
}) => {
  const colorOrder = useColorOrder();
  const chartStyle = useChartStyle();
  let chartToDisplay;
  if (chart.reportType === ReportType.funnel) {
    chartToDisplay = (
      <FunnelChart
        {...transformFunnelChartData({
          datas: chart.data.datas,
          visibleDataMap: chart.visibleDataMap,
          colorOrder,
          labels: chart.data.labels,
        })}
      />
    );
  } else if (chart.chartType === ChartType.line) {
    chartToDisplay = (
      <LineChart
        yPercent={
          chart.reportType === ReportType.retention &&
          chart.retentionNumFormat !== RetentionNumFormat.rawCount
        }
        {...(chart.reportType === ReportType.retention
          ? transformRetentionData({
              datas: chart.data.datas,
              retHeaders: chart.data.retentionHeaders,
              retentionNumFormat: chart.retentionNumFormat,
              colorOrder,
              visibleDataMap: chart.visibleDataMap,
              lineChartStyle: chartStyle.line,
            })
          : transformLineData({
              datas: chart.data.datas,
              dateHeader: chart.data.dateHeaders,
              colorOrder,
              visibleDataMap: chart.visibleDataMap,
              lineChartStyle: chartStyle.line,
              lineChartGroupByTimeType:
                chart.lineChartGroupByTimeType || LineChartGroupByTimeType.day,
            }))}
        disableAnimations
      />
    );
  } else if (chart.chartType === ChartType.bar) {
    chartToDisplay = (
      <BarChart
        {...transformBarData({
          datas: chart.data.datas,
          visibleDataMap: chart.visibleDataMap,
          barChartStyle: chartStyle.bar,
        })}
      />
    );
  } else if (chart.chartType === ChartType.donut) {
    chartToDisplay = (
      <DonutChart
        {...transformDonutData({
          datas: chart.data.datas,
          visibleDataMap: chart.visibleDataMap,
          donutChartStyle: chartStyle.donut,
        })}
      />
    );
  }

  return (
    <div className="card w-full h-full flex flex-col">
      {/* Chart thumbnail header */}
      <Link href={`/chart/${chart.id}`}>
        <div className="px-5 py-3 h-18 hoverable area group border-b border-primary-800 relative">
          <div
            ref={dragRef}
            className="absolute top-4 left-1 mx-auto cursor-grab opacity-0 group-hover:opacity-100"
          >
            <RxDragHandleDots2 />
          </div>
          <h2
            className={`mb-2 text-l font-semibold text-primary-100 group-hover:text-accent-100 transition-colors`}
          >
            {chart.title || "Untitled"}
            {/* <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none opacity-35 ml-2">
            -&gt;
          </span> */}
          </h2>
          <p className={`m-0 max-w-[30ch] subtext truncate`}>
            {chart.description}
          </p>
        </div>
      </Link>

      {/* Chart display */}
      <div className="bg-primary-800/30 pt-1 flex-1 w-full px-2">
        {chartToDisplay}
      </div>
    </div>
  );
};
