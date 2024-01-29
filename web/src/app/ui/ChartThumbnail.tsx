"use client";
import React from "react";
import "chart.js/auto";
import config from "../../../tailwind.config";
import { Bar, Doughnut } from "react-chartjs-2";
import { ChartLegend } from "./Charts/ChartLegend";
import { DonutChart } from "./Charts/DonutChart";
import { LineChart } from "./Charts/LineChart";
import { BarChart } from "./Charts/BarChart";
import {
  placeholderBarData,
  placeholderDonutData,
  placeholderLineData,
} from "./Charts/PlaceholderChartData";
interface ChartThumbnailProps {
  title: string;
  subtitle: string;
  chartType?: string;
  // chart: React.ReactNode;
}

const colors = config.theme.extend.colors;

export const ChartThumbnail: React.FC<ChartThumbnailProps> = ({
  title,
  subtitle,
  chartType,
}) => {
  let chartToDisplay;
  switch (chartType) {
    case "donut":
      chartToDisplay = <DonutChart data={placeholderDonutData} />;
      break;
    case "line":
      chartToDisplay = <LineChart data={placeholderLineData} />;
      break;
    case "bar":
      chartToDisplay = <BarChart data={placeholderBarData} />;
      break;
    default:
      console.log("no chart type specified");
      chartToDisplay = null;
  }

  console.log(chartType);

  return (
    <div className="bg-primary-900 w-full h-full relative m-3 rounded-lg overflow-hidden border border-primary-800 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-primary-600 hover:dark:bg-primary-900/30">
      {/* Chart thumbnail header */}
      <div className="px-5 py-4 h-24">
        <h2 className={`mb-3 text-l font-semibold text-primary-100`}>
          {title}
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none opacity-35 ml-2">
            -&gt;
          </span>
        </h2>
        <p
          className={`m-0 max-w-[30ch] text-xs opacity-50 text-primary-200 overflow-hidden`}
        >
          {subtitle}
        </p>
      </div>

      {/* Chart display */}
      <div className="bg-primary-800 mt-1 h-full">
        <div>{chartToDisplay}</div>
      </div>
    </div>
  );
};
