import React from "react";
import { FloatingTrigger } from "../ui/FloatingTrigger";
import { Metric } from "./metric-selector/Metric";
import { MetricMeasurement } from "@voidpulse/api";
import { IoIosArrowDown } from "react-icons/io";
import { FloatingMenu } from "../ui/FloatingMenu";

interface MeasurementSelectorProps {
  metric?: Metric | null;
}

export const MeasurementSelector: React.FC<MeasurementSelectorProps> = ({
  metric,
}) => {
  return (
    <FloatingTrigger
      appearsOnClick
      placement={"bottom-start"}
      floatingContent={<FloatingMenu></FloatingMenu>}
      className="flex"
    >
      <div className="text-primary-400 text-xs accent-hover px-2 py-2 rounded-md flex items-center">
        {
          {
            [MetricMeasurement.totalEvents]: "Total events",
            [MetricMeasurement.uniqueUsers]: "Unique users",
          }[metric?.type || MetricMeasurement.totalEvents]
        }
        <IoIosArrowDown className="ml-1" />
      </div>
    </FloatingTrigger>
  );
};
