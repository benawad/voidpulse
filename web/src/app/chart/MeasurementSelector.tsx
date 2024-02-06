import { MetricMeasurement } from "@voidpulse/api";
import React from "react";
import { useChartStateContext } from "../../../providers/ChartStateProvider";
import { Dropdown } from "../ui/Dropdown";
import { Metric } from "./metric-selector/Metric";

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
  return (
    <Dropdown
      opts={opts}
      value={metric?.type || MetricMeasurement.uniqueUsers}
      onSelect={(v) => {
        if (metric) {
          setState((state) => {
            return {
              ...state,
              metrics: state.metrics.map((m) => {
                if (m === metric) {
                  return {
                    ...m,
                    type: v,
                  };
                }
                return m;
              }),
            };
          });
        }
      }}
    />
  );
};
