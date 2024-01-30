"use client";
import React from "react";
import "chart.js/auto";
import config from "../../../../tailwind.config";
import { DonutChart } from "../charts/DonutChart";
import { LineChart } from "../charts/LineChart";
import { BarChart } from "../charts/BarChart";
import {
  placeholderBarData,
  placeholderDonutData,
  placeholderLineData,
} from "../charts/PlaceholderChartData";
import Link from "next/link";
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
  let minChartDisplayWidth = 300;
  switch (chartType) {
    case "donut":
      chartToDisplay = <DonutChart data={placeholderDonutData} />;
      minChartDisplayWidth = 300;
      break;
    case "line":
      chartToDisplay = <LineChart data={placeholderLineData} />;
      minChartDisplayWidth = 400;
      break;
    case "bar":
      chartToDisplay = <BarChart data={placeholderBarData} />;
      minChartDisplayWidth = 600;
      break;
    default:
      chartToDisplay = null;
  }

  return (
    <div className="card w-full h-full">
      {/* Chart thumbnail header */}
      <Link href="/chart">
        <div className="px-5 py-3 h-18 hoverable area group border-b border-primary-800 ">
          <h2
            className={`mb-2 text-l font-semibold text-primary-100 group-hover:text-secondary-signature-100 transition-colors`}
          >
            {title}
            {/* <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none opacity-35 ml-2">
            -&gt;
          </span> */}
          </h2>
          <p className={`m-0 max-w-[30ch] subtext overflow-hidden`}>
            {subtitle}
          </p>
        </div>
      </Link>

      {/* Chart display */}
      <div className="bg-primary-800/30 pt-1 h-full overflow-x-scroll">
        <div
          style={{
            minWidth: minChartDisplayWidth,
            height: "100%",
            // minHeight: "400px",
          }}
        >
          {chartToDisplay}
        </div>
      </div>
    </div>
  );
};
