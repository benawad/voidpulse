"use client";
import {
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
  RetentionNumFormat,
} from "@voidpulse/api";
import "chart.js/auto";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useChartStyle } from "../../themes/useChartStyle";
import { useColorOrder } from "../../themes/useColorOrder";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import { BarChart } from "../../ui/charts/BarChart";
import { DonutChart } from "../../ui/charts/DonutChart";
import { FunnelChart } from "../../ui/charts/FunnelChart";
import { LineChart } from "../../ui/charts/LineChart";
import { MoreChartOptionsButton } from "../../ui/charts/MoreChartOptionsButton";
import { transformBarData } from "../../utils/transformBarData";
import { transformDonutData } from "../../utils/transformDonutData";
import { transformFunnelChartData } from "../../utils/transformFunnelData";
import { transformRetentionData } from "../../utils/transformRetentionData";
import { transformLineData } from "../../utils/transformToLineData";
import { RouterOutput, trpc } from "../../utils/trpc";
import { chartToTagline } from "../../utils/chartToTagline";

interface ChartThumbnailProps {
  dragRef: any;
  chart: RouterOutput["getCharts"]["charts"][0];
}

const ONE_HOUR = 1000 * 60 * 60;

export const ChartThumbnail: React.FC<ChartThumbnailProps> = ({
  chart,
  dragRef,
}) => {
  const vars = {
    breakdowns: chart.breakdowns || [],
    chartId: chart.id,
    from: chart.from || undefined,
    to: chart.to || undefined,
    globalFilters: chart.globalFilters || [],
    metrics: chart.metrics,
    projectId: chart.projectId,
    reportType: chart.reportType,
    timeRangeType: chart.timeRangeType,
    chartType: chart.chartType,
    lineChartGroupByTimeType: chart.lineChartGroupByTimeType || undefined,
  };

  const { data, isLoading } = trpc.getReport.useQuery(vars, {
    enabled:
      new Date().getTime() > new Date(chart.dataUpdatedAt).getTime() + ONE_HOUR,
  });
  const utils = trpc.useUtils();
  const { boardId } = useProjectBoardContext();
  useEffect(() => {
    if (data) {
      const { chartId, ...rest } = vars;
      utils.getReport.setData(rest, data);
      utils.getCharts.setData(
        { projectId: chart.projectId, boardId },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            charts: oldData.charts.map((c) => {
              if (c.id === chart.id) {
                return {
                  ...c,
                  data,
                };
              }
              return c;
            }),
          };
        }
      );
    }
  }, [data]);

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
  const [isMoreOptionsHovered, setIsMoreOptionsHovered] = useState(false);

  return (
    <div className="card w-full h-full flex flex-col">
      {/* Chart thumbnail header */}
      <div
        className={`px-5 py-3 h-18 group border-b border-primary-800 relative cursor-grab transition-colors ${isMoreOptionsHovered ? "hover:bg-primary-900" : "hover:bg-primary-800"} `}
        ref={dragRef}
      >
        {/* Space out the drag handle, title, and more options buttons */}

        <div className="flex flex-row justify-between">
          <Link href={`/chart/${chart.id}`}>
            <div className="absolute top-4 left-1 mx-auto cursor-grab opacity-0 group-hover:opacity-100">
              <RxDragHandleDots2 />
            </div>
            {/* Title and description */}
            <div>
              <div
                className={`text-l mb-1 font-semibold text-primary-100 group-hover:text-accent-100 transition-colors truncate`}
              >
                {chart.title || "Untitled"}
              </div>

              <p className={`m-0 max-w-[30ch] subtext truncate`}>
                {chartToTagline(chart)}
                {chart.description ? ` • ${chart.description}` : ""}
              </p>
            </div>
          </Link>

          {isLoading ? (
            <LoadingSpinner size={30} />
          ) : (
            <div
              onMouseEnter={() => {
                setIsMoreOptionsHovered(true);
              }}
              onMouseLeave={() => {
                setIsMoreOptionsHovered(false);
              }}
              className="items-center"
            >
              <MoreChartOptionsButton chartId={chart.id} />
            </div>
          )}
        </div>
      </div>

      {/* Chart display */}
      <div className="bg-primary-800/30 pt-1 flex-1 w-full px-2">
        {chartToDisplay}
      </div>
    </div>
  );
};
