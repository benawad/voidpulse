import React from "react";
import { BsBarChart } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { LiaChartAreaSolid } from "react-icons/lia";
import { SlGraph } from "react-icons/sl";
import { Metric, MetricBlock } from "./metric-selector/MetricBlock";

interface ChartEditorSidebarProps {
  metrics: (Metric | null)[];
  setMetrics: React.Dispatch<React.SetStateAction<(Metric | null)[]>>;
}

export const ChartEditorSidebar: React.FC<ChartEditorSidebarProps> = ({
  metrics,
  setMetrics,
}) => {
  const controlOptionsStyle =
    "accent-hover p-2 my-2 rounded-md flex items-center group justify-between text-primary-200 text-sm font-semibold";
  const plusIcon = (
    <div className="w-6 h-6 rounded-md mr-3">
      <FaPlus
        className="m-auto group-hover:fill-secondary-signature-100 h-full w-full"
        style={{ padding: 5 }}
        size={12}
      />
    </div>
  );

  const reportTypeButtonStyle =
    "accent-hover py-2 rounded-md w-full m-1 flex items-center bg-primary-800/50 flex flex-col text-xs text-primary-600";
  const reportTypeIconStyle = "w-8 h-8 rounded-md my-2 text-primary-400";

  return (
    <div
      className="border-r p-4 bg-primary-900 border-primary-800"
      style={{ width: 400 }}
    >
      {/* Choosing report type */}
      <div className="flex flex-row w-full justify-between">
        <div className={reportTypeButtonStyle}>
          <SlGraph className={reportTypeIconStyle} />
        </div>
        <div className={reportTypeButtonStyle}>
          <BsBarChart className={"-scale-x-100 " + reportTypeIconStyle} />
        </div>
        <div className={reportTypeButtonStyle}>
          <LiaChartAreaSolid
            className={"-scale-x-100 " + reportTypeIconStyle}
          />
        </div>
      </div>

      {/* Choosing metrics */}
      <div className={controlOptionsStyle}>Metrics {plusIcon}</div>
      {metrics.map((m, idx) => (
        <MetricBlock
          onEventNameChange={(name) => {
            setMetrics(
              metrics.map((metric, i) =>
                i === idx ? { ...metric, name } : metric
              )
            );
          }}
          idx={idx}
          metric={m}
        />
      ))}

      {/* Choosing filters */}
      <div className={controlOptionsStyle}>Filter {plusIcon}</div>

      {/* Choosing breakdown */}
      <div className={controlOptionsStyle}>Breakdown {plusIcon}</div>
    </div>
  );
};
