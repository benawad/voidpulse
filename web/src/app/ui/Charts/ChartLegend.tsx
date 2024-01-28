import React from "react";

interface ChartLegendProps {
  labels: string[];
  colors: string[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ labels, colors }) => {
  return (
    <div className="flex justify-between mb-4">
      {labels.map((label, i) => {
        return (
          <div className="flex bg-primary-700 rounded-md px-2 py-1 m-2">
            <div
              className="rounded-md h-4 w-4 my-auto"
              style={{ backgroundColor: colors[i] }}
            />
            <div className="ml-2 text-primary-200">{label}</div>
          </div>
        );
      })}
    </div>
  );
};
