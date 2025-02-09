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
                  metric={metric}
                  aggValue={active && opt.agg ? metric?.typeAgg : undefined}
                  propValue={active && opt.prop ? metric?.typeProp : undefined}
                  onProp={
                    opt.prop
                      ? (prop, agg) => {
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
                                      typeAgg: agg,
                                      typeProp: prop,
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
              [AggType.sum]: "Sum Frequency per user",
              [AggType.sumDivide100]: "Sum/100 Frequency per user",
            }[metric?.typeAgg || AggType.avg]
          : chosenOption?.value === MetricMeasurement.aggProp
            ? `${
                {
                  [AggType.avg]: "Average",
                  [AggType.median]: "Median",
                  [AggType.percentile25]: "P25",
                  [AggType.percentile75]: "P75",
                  [AggType.percentile90]: "P90",
                  [AggType.min]: "Min",
                  [AggType.max]: "Max",
                  [AggType.sum]: "Sum",
                  [AggType.sumDivide100]: "Sum/100",
                }[metric?.typeAgg || AggType.avg]
              } of ${metric?.typeProp?.name}`
            : chosenOption?.label}
      </DropdownStartButton>
    </FloatingTrigger>
  );
};
