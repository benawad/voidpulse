import React from "react";

interface ChartLegendProps {
  labels: string[];
  colors: string[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ labels, colors }) => {
  //Don't bother with the legend if there's only one color.
  if (labels.length === 1) {
    return null;
  }
  return (
    <div className="flex overflow-hidden w-full flex-wrap">
      {labels.map((label, i) => {
        return (
          <div
            key={i + label}
            className="flex bg-primary-700/50 rounded-md px-2 py-1 m-1"
          >
            <div
              className="rounded-sm h-3 w-3 my-auto"
              style={{ backgroundColor: colors[i] }}
            />
            <div className="ml-2 text-primary-200 text-xs">{label}</div>
          </div>
        );
      })}
    </div>
  );
};
