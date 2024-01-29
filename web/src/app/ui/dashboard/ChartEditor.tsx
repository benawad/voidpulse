import React from "react";
import { LineChart } from "../charts/LineChart";
import { placeholderLineData } from "../charts/PlaceholderChartData";
interface ChartEditorProps {}

//Error: "category" is not a registered scale.
//Sometimes this shows up, sometimes it doesnt...
export const ChartEditor: React.FC<ChartEditorProps> = ({}) => {
  return (
    <div>
      <div className="bg-primary-300">Top editor</div>
      {/* View that houses editor and chart side by side */}
      <div className="flex grow-full h-full bg-slate-50">
        {/* Toolbar */}
        <div className="px-12 bg-primary-700" style={{ width: 400 }}>
          Toolbar
        </div>
        {/* Chart view panel */}
        <div className="w-full">
          {/* Just the chart */}
          <div
            className="bg-primary-900"
            style={{ minWidth: 800, minHeight: 500 }}
          >
            <h1 className="font-bold text-lg text-primary-100 px-2">
              Chart title
            </h1>
            <LineChart data={placeholderLineData} />
          </div>
          {/* Additional data at the bottom */}
          <div className="bg-primary-600">Data at the bottom</div>
        </div>
      </div>
    </div>
  );
};
