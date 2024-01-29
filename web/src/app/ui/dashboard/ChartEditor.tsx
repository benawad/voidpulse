import React from "react";
import { LineChart } from "../charts/LineChart";
import { placeholderLineData } from "../Charts/PlaceholderChartData";

interface ChartEditorProps {}

//Error: "category" is not a registered scale.
//Sometimes this shows up, sometimes it doesnt...
export const ChartEditor: React.FC<ChartEditorProps> = ({}) => {
  return (
    <div className="flex w-full h-full bg-slate-50">
      <div className="px-12 bg-primary-700">Toolbar</div>
      {/* Chart view panel */}
      <div>
        {/* Just the chart */}
        <div className="bg-primary-800 w-full">
          <h1 className="font-bold text-lg text-primary-100 px-2">
            Chart title
          </h1>
          <div className="w-full">
            <LineChart data={placeholderLineData} />
          </div>
        </div>
        {/* Additional data at the bottom */}
        <div className="bg-primary-600">Data at the bottom</div>
      </div>
    </div>
  );
};
