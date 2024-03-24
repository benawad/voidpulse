import { AggType, MetricMeasurement } from "@voidpulse/api";
import React from "react";
import { useChartStateContext } from "../../../../../providers/ChartStateProvider";
import {
  Dropdown,
  DropdownOption,
  DropdownStartButton,
} from "../../../ui/Dropdown";
import { Metric } from "./metric-selector/Metric";
import { FloatingTrigger } from "../../../ui/FloatingTrigger";
import { FloatingMenu } from "../../../ui/FloatingMenu";

interface MeasurementSelectorProps {
  metric?: Metric | null;
}

const opts = [
  { label: "Total events", value: MetricMeasurement.totalEvents },
  { label: "Unique users", value: MetricMeasurement.uniqueUsers },
  {
    label: "Frequency per user",
    value: MetricMeasurement.frequencyPerUser,
    agg: true,
  },
  {
    label: "Aggregated property",
    value: MetricMeasurement.aggProp,
    agg: true,
    prop: true,
  },
];

export const MeasurementSelector: React.FC<MeasurementSelectorProps> = ({
  metric,
}) => {
  const [, setState] = useChartStateContext();
  const chosenOption = opts.find(
    (x) => x.value === (metric?.type || MetricMeasurement.uniqueUsers)
  );

  return (
    <FloatingTrigger
      appearsOnClick
      placement="bottom-start"
      portal
      noCloseOnClick
      floatingContent={(setOpen) => (
        <FloatingMenu>
          {opts.map((opt) => {
            const active = opt.value === chosenOption?.value;
            return (
              <React.Fragment key={opt.label}>
                <DropdownOption
                  aggValue={active && opt.agg ? metric?.typeAgg : undefined}
                  onAgg={
                    opt.agg
                      ? (aggValue) => {
                          if (metric) {
                            setOpen(false);
                            setState((state) => {
                              return {
                                ...state,
                                metrics: state.metrics.map((m) => {
                                  if (m === metric) {
                                    return {
                                      ...m,
                                      type: opt.value,
                                      typeAgg: aggValue,
                                    };
                                  }
                                  return m;
                                }),
                              };
                            });
                          }
                        }
                      : undefined
                  }
                  onClick={() => {
                    if (metric) {
                      setOpen(false);
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
                  active={active}
                >
                  {opt.label}
                </DropdownOption>
              </React.Fragment>
            );
          })}
        </FloatingMenu>
      )}
      className="flex"
    >
      <DropdownStartButton>
        {chosenOption?.value === MetricMeasurement.frequencyPerUser
          ? {
              [AggType.avg]: "Average Frequency per user",
              [AggType.median]: "Median Frequency per user",
              [AggType.percentile25]: "P25 Frequency per user",
              [AggType.percentile75]: "P75 Frequency per user",
              [AggType.percentile90]: "P90 Frequency per user",
              [AggType.min]: "Min Frequency per user",
              [AggType.max]: "Max Frequency per user",
            }[metric?.typeAgg || AggType.avg]
          : chosenOption?.label}
      </DropdownStartButton>
    </FloatingTrigger>
  );
};
