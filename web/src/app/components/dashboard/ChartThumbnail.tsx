"use client";
import { ChartType } from "@voidpulse/api";
import "chart.js/auto";
import Link from "next/link";
import React from "react";
import config from "../../../../tailwind.config";
import { BarChart } from "../../ui/charts/BarChart";
import { DonutChart } from "../../ui/charts/DonutChart";
import { LineChart } from "../../ui/charts/LineChart";
import {
  placeholderBarData,
  placeholderDonutData,
} from "../../ui/charts/PlaceholderChartData";
import { RouterOutput } from "../../utils/trpc";
interface ChartThumbnailProps {
  chart: RouterOutput["getCharts"]["charts"][0];
}

const colors = config.theme.extend.colors;

export const ChartThumbnail: React.FC<ChartThumbnailProps> = ({ chart }) => {
  let chartToDisplay;
  let minChartDisplayWidth = 300;
  switch (chart.type) {
    case ChartType.donut:
      chartToDisplay = <DonutChart data={placeholderDonutData} />;
      minChartDisplayWidth = 300;
      break;
    case ChartType.line:
      chartToDisplay = <LineChart data={chart.data} />;
      minChartDisplayWidth = 400;
      break;
    case ChartType.bar:
      chartToDisplay = <BarChart data={placeholderBarData} />;
      minChartDisplayWidth = 600;
      break;
    default:
      chartToDisplay = null;
  }

  return (
    <div className="card w-full h-full">
      {/* Chart thumbnail header */}
      <Link href={`/chart/${chart.id}`}>
        <div className="px-5 py-3 h-18 hoverable area group border-b border-primary-800 ">
          <h2
            className={`mb-2 text-l font-semibold text-primary-100 group-hover:text-secondary-signature-100 transition-colors`}
          >
            {chart.title}
            {/* <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none opacity-35 ml-2">
            -&gt;
          </span> */}
          </h2>
          <p className={`m-0 max-w-[30ch] subtext overflow-hidden`}>
            {chart.description}
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
