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
      padding: {
        left: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: false,
        position: "nearest",
        // external: externalTooltipHandler,
        backgroundColor: colors.primary[900],
        titleFont: { weight: "bold", family: "Helvetica Neue" },
        padding: 12,
        borderWidth: 1,
        borderColor: colors.primary[700],
        caretSize: 10,
      },
    },
  };

  return (
    <a
      href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
      className="bg-primary-900 m-3 group rounded-lg overflow-hidden border border-primary-800 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-primary-600 hover:dark:bg-primary-900/30"
      target="_blank"
      rel="noopener noreferrer"
    >
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
      <div className="bg-primary-800 mt-1" style={{}}>
        <div className="m-2 p-4">
          <ChartLegend
            labels={doughnutData.labels}
            colors={doughnutData.datasets[0].backgroundColor}
          />
          {chartType === "donut" ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : null}
        </div>
      </div>
    </a>
  );
};
