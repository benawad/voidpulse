import React from "react";
import { LineChart } from "../charts/LineChart";
import { placeholderLineData } from "../charts/PlaceholderChartData";
import Link from "next/link";
interface ChartEditorProps {}

//Error: "category" is not a registered scale.
//Sometimes this shows up, sometimes it doesnt...
export const ChartEditor: React.FC<ChartEditorProps> = ({}) => {
  return (
    <div>
      {/* Navigation that shows hierarchy of dashboards */}
      <div className="h-14 border-b border-primary-700 items-center flex">
        <Link href="/">
          <div className="mx-4 text-sm text-primary-500">Back to dashboard</div>
        </Link>
      </div>
      {/* View that houses editor and chart side by side */}
      <div className="flex grow w-full h-full">
        {/* Toolbar */}
        <div className="border-r p-4 border-primary-700" style={{ width: 400 }}>
          <div className="hoverable area text p-2 rounded-md">Metrics</div>
          <div className="hoverable area text p-2 rounded-md">Filter</div>
          <div className="hoverable area text p-2 rounded-md">Breakdown</div>
        </div>
        {/* Chart view panel */}
        <div className="w-full">
          {/* Just the chart */}
          <div className="p-12" style={{ minWidth: 800, minHeight: 500 }}>
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
