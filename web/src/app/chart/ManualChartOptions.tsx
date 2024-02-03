import React, { useState } from "react";
import { Metric } from "./metric-selector/Metric";
import { MetricMeasurement, ReportType } from "@voidpulse/api";
import { BsBarChart } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { LiaChartAreaSolid } from "react-icons/lia";
import { SlGraph } from "react-icons/sl";
import { TiFlowSwitch } from "react-icons/ti";
import { genId } from "../utils/genId";
import { MetricBlock } from "./metric-selector/MetricBlock";

interface ManualChartOptionsProps {
  metrics: Metric[];
  setMetrics: React.Dispatch<React.SetStateAction<Metric[]>>;
  reportType: ReportType;
  setReportType: React.Dispatch<React.SetStateAction<ReportType>>;
}

export const ManualChartOptions: React.FC<ManualChartOptionsProps> = ({
  metrics,
  setMetrics,
  reportType,
  setReportType,
}) => {
  const [addNewMetric, setAddNewMetric] = useState(false);

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
    {
      name: "Flow",
      icon: <TiFlowSwitch className={reportTypeIconStyle} />,
      type: ReportType.flow,
    },
  ];

  // For the lower sections where you toggle data, filters, breakdowns
  const inputOptionsStyle =
    "accent-hover p-2 my-2 rounded-md flex items-center group justify-between text-primary-100 text-lg font-semibold";
  const plusIcon = (
    <div className="w-6 h-6 rounded-md mr-3">
      <FaPlus
        className="m-auto group-hover:fill-secondary-signature-100 h-full w-full"
        style={{ padding: 5 }}
        size={12}
      />
    </div>
  );

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
                setReportType(rt.type);
              }}
            >
              {rt.icon}
            </button>
          );
        })}
      </div>

      {/* Choosing metrics */}
      <div
        className={inputOptionsStyle}
        onClick={() => {
          setAddNewMetric(true);
        }}
      >
        Data {plusIcon}
      </div>
      {/* Display all chosen metrics  */}
      {metrics.map((m, idx) => (
        <MetricBlock
          key={m.id}
          onEventNameChange={(name) => {
            setMetrics(
              metrics.map((metric, i) =>
                i === idx ? { ...metric, eventName: name } : metric
              )
            );
          }}
          onDelete={() => {
            setMetrics(metrics.filter((_, i) => i !== idx));
          }}
          onAddFilter={(newFilter) => {
            setMetrics(
              metrics.map((metric, i) =>
                i === idx
                  ? {
                      ...metric,
                      filters: [...(metric?.filters || []), newFilter],
                    }
                  : metric
              )
            );
          }}
          onDeleteFilter={(deletedFilter) => {
            setMetrics(
              metrics.map((metric, i) =>
                i === idx
                  ? {
                      ...metric,
                      filters: [
                        ...(metric?.filters?.filter(
                          (f) => f !== deletedFilter
                        ) || []),
                      ],
                    }
                  : metric
              )
            );
          }}
          idx={idx}
          metric={m}
        />
      ))}
      {/* If a new metric is in the process of being added, display a new metric block UI as an input*/}
      {/* Once the metric is successfully added, hide the new block and show it as part of the list above. */}
      {addNewMetric ? (
        <MetricBlock
          onEventNameChange={(name) => {
            setMetrics([
              ...metrics,
              {
                eventName: name,
                id: genId(),
                filters: [],
                type: MetricMeasurement.totalEvents,
              },
            ]);
            setAddNewMetric(false);
          }}
          idx={metrics.length}
        />
      ) : null}

      {/* Choosing date range */}
      {/* Choosing filters */}
      <div className={inputOptionsStyle}>Filter {plusIcon}</div>

      {/* Choosing breakdown */}
      <div className={inputOptionsStyle}>Breakdown {plusIcon}</div>
    </>
  );
};
