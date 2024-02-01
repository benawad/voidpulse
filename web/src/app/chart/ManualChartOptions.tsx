import React, { useState } from "react";
import { Metric } from "./metric-selector/Metric";
import { MetricMeasurement } from "@voidpulse/api";
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
}

export const ManualChartOptions: React.FC<ManualChartOptionsProps> = ({
  metrics,
  setMetrics,
}) => {
  const [addNewMetric, setAddNewMetric] = useState(false);

  const reportTypeIconStyle = "w-8 h-8 rounded-md my-2 text-primary-400";
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

  const reportTypeButtonStyle =
    "accent-hover py-2 rounded-md w-full m-1 flex items-center bg-primary-800/50 flex flex-col text-xs text-primary-600";

  const reportTypes = [
    { name: "Insights", icon: <SlGraph className={reportTypeIconStyle} /> },
    {
      name: "Funnels",
      icon: <BsBarChart className={"-scale-x-100 " + reportTypeIconStyle} />,
    },
    {
      name: "Retention",
      icon: (
        <LiaChartAreaSolid className={"-scale-x-100 " + reportTypeIconStyle} />
      ),
    },
    { name: "Flow", icon: <TiFlowSwitch className={reportTypeIconStyle} /> },
  ];

  return (
    <>
      {/* Choosing report type */}
      <div className="flex flex-row w-full justify-between my-2">
        {reportTypes.map((type) => {
          return (
            <button key={type.name} className={reportTypeButtonStyle}>
              {type.icon}
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
        Metrics {plusIcon}
      </div>
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
