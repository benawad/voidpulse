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
      chartToDisplay = null;
  }

  return (
    <div className="card w-full h-full">
      {/* Chart thumbnail header */}
      <Link href="/chart">
        <div className="px-5 py-4 h-24 hoverable area group">
          <h2
            className={`mb-3 text-l font-semibold text-primary-100 group-hover:text-secondary-signature-100 transition-colors`}
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
      <div className="bg-primary-800/30 pt-1 h-full">
        <div>{chartToDisplay}</div>
      </div>
    </div>
  );
};
