import { ReportType } from "@voidpulse/api";
import React from "react";
import { BsBarChart } from "react-icons/bs";
import { LiaChartAreaSolid } from "react-icons/lia";
import { SlGraph } from "react-icons/sl";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { InsightSidebar } from "./InsightSidebar";
import { RetentionSidebar } from "./RetentionSidebar";
import { FunnelSidebar } from "./FunnelSidebar";

interface ManualChartOptionsProps {}

export const ManualChartOptions: React.FC<ManualChartOptionsProps> = ({}) => {
  const [{ reportType }, setState] = useChartStateContext();

  // Top section with square icons
  const reportTypeIconStyle = "w-6 h-6 rounded-md";
  const reportTypeButtonStyle = `accent-hover group py-1 w-full flex items-center flex flex-row text-xs`;
  const reportTypes = [
    {
      name: "Insights",
      icon: <SlGraph className={reportTypeIconStyle} />,
      type: ReportType.insight,
      colorClass: "text-indigo-500",
    },
    {
      name: "Funnels",
      icon: <BsBarChart className={"-scale-x-100 " + reportTypeIconStyle} />,
      type: ReportType.funnel,
      colorClass: "text-cyan-500",
    },
    {
      name: "Retention",
      icon: (
        <LiaChartAreaSolid className={"-scale-x-100 " + reportTypeIconStyle} />
      ),
      type: ReportType.retention,
      colorClass: "text-pink-500",
    },
    // {
    //   name: "Flow",
    //   icon: <TiFlowSwitch className={reportTypeIconStyle} />,
    //   type: ReportType.flow,
    // },
  ];

  return (
    <>
      {/* Choosing report type */}
      <div className="flex flex-row w-full justify-between mt-2 mono-body">
        {reportTypes.map((rt) => {
          return (
            <button
              key={rt.name}
              className={
                reportTypeButtonStyle +
                " " +
                (rt.type === reportType
                  ? `text-primary-100`
                  : "text-primary-500 bg-primary-800")
              }
              onClick={() => {
                setState((prev) => {
                  let metrics = prev.metrics;
                  if (
                    rt.type === ReportType.retention &&
                    prev.metrics.length > 2
                  ) {
                    metrics = prev.metrics.slice(0, 2);
                  }
                  return { ...prev, metrics, reportType: rt.type };
                });
              }}
            >
              {/* Div around icon */}
              <div
                className={`rounded-full group-hover:text-accent-100 w-8 h-8 flex items-center justify-center ml-3 mr-1 ${
                  rt.type === reportType
                    ? "text-primary-100"
                    : "text-primary-500"
                }`}
              >
                {rt.icon}
              </div>
              {rt.name}
            </button>
          );
        })}
      </div>
      <div className="px-4">
        {reportType === ReportType.insight ? <InsightSidebar /> : null}
        {reportType === ReportType.funnel ? <FunnelSidebar /> : null}
        {reportType === ReportType.retention ? <RetentionSidebar /> : null}
      </div>
    </>
  );
};
