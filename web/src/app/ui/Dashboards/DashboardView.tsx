import React from "react";
import { ChartThumbnail } from "./ChartThumbnail";
import { placeholderCharts } from "../Charts/PlaceholderChartData";

interface DashboardViewProps {}
let charts = placeholderCharts;

export const DashboardView: React.FC<DashboardViewProps> = ({}) => {
  return (
    <div>
      {/* Dashboard of chart thumbnails shows up here */}
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
