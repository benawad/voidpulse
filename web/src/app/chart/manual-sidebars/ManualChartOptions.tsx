import { ReportType } from "@voidpulse/api";
import React from "react";
import { BsBarChart } from "react-icons/bs";
import { LiaChartAreaSolid } from "react-icons/lia";
import { SlGraph } from "react-icons/sl";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { InsightSidebar } from "./InsightSidebar";
import { RetentionSidebar } from "./RetentionSidebar";

interface ManualChartOptionsProps {}

export const ManualChartOptions: React.FC<ManualChartOptionsProps> = ({}) => {
  const [{ reportType }, setState] = useChartStateContext();

  // Top section with square icons
  const reportTypeIconStyle = "w-8 h-8 rounded-md my-2 text-primary-400";
  const reportTypeButtonStyle = `accent-hover py-1 rounded-md w-full m-1 flex items-center flex flex-col text-xs border border-primary-800`;
  const reportTypes = [
    {
      name: "Insights",
      icon: <SlGraph className={reportTypeIconStyle} />,
      type: ReportType.insight,
    },
    {
      name: "Funnels",
      icon: <BsBarChart className={"-scale-x-100 " + reportTypeIconStyle} />,
      type: ReportType.funnel,
    },
    {
      name: "Retention",
      icon: (
        <LiaChartAreaSolid className={"-scale-x-100 " + reportTypeIconStyle} />
      ),
      type: ReportType.retention,
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
      <div className="flex flex-row w-full justify-between my-2">
        {reportTypes.map((rt) => {
          return (
            <button
              key={rt.name}
              className={
                reportTypeButtonStyle +
                " " +
                (rt.type === reportType ? "bg-primary-700" : "")
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
              {rt.icon}
            </button>
          );
        })}
      </div>
      {reportType === ReportType.insight ? <InsightSidebar /> : null}
      {reportType === ReportType.retention ? <RetentionSidebar /> : null}
    </>
  );
};
