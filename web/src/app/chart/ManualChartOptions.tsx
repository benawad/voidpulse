import { MetricMeasurement, ReportType } from "@voidpulse/api";
import React, { useState } from "react";
import { BsBarChart } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { LiaChartAreaSolid } from "react-icons/lia";
import { SlGraph } from "react-icons/sl";
import { TiFlowSwitch } from "react-icons/ti";
import { useChartStateContext } from "../../../providers/ChartStateProvider";
import { genId } from "../utils/genId";
import { Metric } from "./metric-selector/Metric";
import { MetricBlock } from "./metric-selector/MetricBlock";
import { BreakdownBlock } from "./metric-selector/BreakdownBlock";

interface ManualChartOptionsProps {}

export const ManualChartOptions: React.FC<ManualChartOptionsProps> = ({}) => {
  const [{ metrics, breakdowns, reportType }, setState] =
    useChartStateContext();
  const setMetrics = (newMetrics: Metric[]) => {
    setState((prev) => ({ ...prev, metrics: newMetrics }));
  };
  const [addNewMetric, setAddNewMetric] = useState(false);
  const [addNewBreakdown, setAddNewBreakdown] = useState(false);

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
                setState((prev) => ({ ...prev, reportType: rt.type }));
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
                i === idx ? { ...metric, eventName: name, filters: [] } : metric
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
          onDelete={() => {
            setAddNewMetric(false);
          }}
          idx={metrics.length}
        />
      ) : null}

      {/* Choosing date range */}
      {/* Choosing filters */}
      <div className={inputOptionsStyle}>Filter {plusIcon}</div>

      {/* Choosing breakdown */}
      <button
        onClick={() => setAddNewBreakdown(true)}
        className={`${inputOptionsStyle} w-full`}
      >
        Breakdown {plusIcon}
      </button>
      {addNewBreakdown ? (
        <BreakdownBlock
          breakdown={breakdowns[0]}
          onBreakdown={(propKey) => {
            setState((prev) => ({ ...prev, breakdowns: [propKey] }));
          }}
          onDelete={() => {
            setState((prev) => ({ ...prev, breakdowns: [] }));
            setAddNewBreakdown(false);
          }}
          onEmptyBreakdownAbandoned={() => {
            setAddNewBreakdown(false);
          }}
        />
      ) : null}
    </>
  );
};
