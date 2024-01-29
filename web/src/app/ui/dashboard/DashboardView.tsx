import React from "react";
import { ChartThumbnail } from "./ChartThumbnail";
import { placeholderCharts } from "../charts/PlaceholderChartData";

interface DashboardViewProps {}
let charts = placeholderCharts;

export const DashboardView: React.FC<DashboardViewProps> = ({}) => {
  return (
    <div>
      <div className="py-6">
        <div className="text-2xl font-bold sticky py-1">Dashboard title</div>
        <div className="text-xs subtext">Here are our main charts.</div>
      </div>
      <div className="grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left overscroll-none">
        {charts.map((chart) => {
          return (
            <div className="m-2">
              <ChartThumbnail
                key={chart.title}
                title={chart.title}
                subtitle={chart.subtitle}
                chartType={chart.chartType}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
