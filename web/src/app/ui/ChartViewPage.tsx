import React from "react";
import { LineChart } from "./Charts/LineChart";
import { placeholderLineData } from "./Charts/PlaceholderChartData";

interface ChartViewPageProps {}

export const ChartViewPage: React.FC<ChartViewPageProps> = ({}) => {
  return (
    <div>
      <LineChart data={placeholderLineData} />
    </div>
  );
};
