"use client";
import React from "react";
import "chart.js/auto";
import config from "../../../tailwind.config";
import { Doughnut } from "react-chartjs-2";
import { ChartLegend } from "./Charts/ChartLegend";
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
  const barData = {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const doughnutData = {
    labels: ["Anxious", "Anger", "Sad", "Envy"],
    datasets: [
      {
        label: "My First Dataset",
        data: [300, 50, 100, 75],
        backgroundColor: [
          colors.secondary["zen-100"],
          colors.secondary["energy-100"],
          colors.secondary["mind-100"],
          colors.secondary["body-100"],
        ],
        borderColor: ["transparent"],
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    layout: {
      autoPadding: true,
    },
    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: false,
        // external: externalTooltipHandler,
        // backgroundColor: colors.primary[900],
        // titleFont: { weight: "bold", family: "Helvetica Neue" },
        // padding: 12,
        // borderWidth: 1,
        // borderColor: colors.primary[700],
        // caretSize: 10,
      },
    },
  };

  return (
    <div className="bg-primary-900 w-full relative m-3 rounded-lg overflow-hidden border border-primary-800 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-primary-600 hover:dark:bg-primary-900/30">
      {/* Chart thumbnail header */}
      <div className="px-5 py-4">
        <h2 className={`mb-3 text-l font-semibold text-primary-100`}>
          {title}
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none opacity-35 ml-2">
            -&gt;
          </span>
        </h2>
        <p className={`m-0 max-w-[30ch] text-xs opacity-50 text-primary-200`}>
          {subtitle}
        </p>
      </div>

      {/* Chart display */}
      <div className="bg-primary-800 mt-1">
        <div>
          {/* Donut chart */}
          {chartType === "donut" ? (
            <div className="">
              <ChartLegend
                labels={doughnutData.labels}
                colors={doughnutData.datasets[0].backgroundColor}
              />
              <div className="p-3 relative flex justify-center items-center margin-0">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                {/* Total events center label */}
                <div className="absolute top-0 bottom-0 my-auto right-0 left-0 mx-auto h-12">
                  <div className="text-3xl font-bold text-center">99</div>
                  <div className="text-xs text-center">total</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
