import React, { use } from "react";
import { FloatingTrigger } from "../ui/FloatingTrigger";
import { Metric } from "./metric-selector/Metric";
import { MetricMeasurement } from "@voidpulse/api";
import { IoIosArrowDown } from "react-icons/io";
import { FloatingMenu } from "../ui/FloatingMenu";
import { useChartStateContext } from "../../../providers/ChartStateProvider";

interface MeasurementSelectorProps {
  metric?: Metric | null;
}

const opts = [
  { label: "Total events", value: MetricMeasurement.totalEvents },
  { label: "Unique users", value: MetricMeasurement.uniqueUsers },
];

export const MeasurementSelector: React.FC<MeasurementSelectorProps> = ({
  metric,
}) => {
  const [, setState] = useChartStateContext();
  const currValue = metric?.type || MetricMeasurement.totalEvents;
  return (
    <FloatingTrigger
      appearsOnClick
      placement={"bottom-start"}
      floatingContent={
        <FloatingMenu>
          {opts.map((opt) => (
            <button
              onClick={() => {
                if (metric) {
                  setState((state) => {
                    return {
                      ...state,
                      metrics: state.metrics.map((m) => {
                        if (m === metric) {
                          return {
                            ...m,
                            type: opt.value,
                          };
                        }
                        return m;
                      }),
                    };
                  });
                }
              }}
              key={opt.value}
              className={
                "flex flex-row p-2 accent-hover group rounded-md " +
                (opt.value === currValue
                  ? "bg-secondary-signature-100 text-primary-100"
                  : "")
              }
            >
              <div className="text-primary-200 group-hover:text-secondary-signature-100">
                {opt.label}
              </div>
            </button>
          ))}
        </FloatingMenu>
      }
      className="flex"
    >
      <div className="text-primary-400 text-xs accent-hover px-2 py-2 rounded-md flex items-center">
        {opts.find((x) => x.value === currValue)?.label}
        <IoIosArrowDown className="ml-1" />
      </div>
    </FloatingTrigger>
  );
};
