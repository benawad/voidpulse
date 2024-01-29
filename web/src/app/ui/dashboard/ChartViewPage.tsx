import React from "react";
import { LineChart } from "../charts/LineChart";
import { placeholderLineData } from "../Charts/PlaceholderChartData";

interface ChartViewPageProps {}

export const ChartViewPage: React.FC<ChartViewPageProps> = ({}) => {
  return (
    <div className="w-6/12">
      <h1 className="font-bold text-lg text-primary-100">Chart title</h1>
      <LineChart data={placeholderLineData} />
    </div>
  );
};
