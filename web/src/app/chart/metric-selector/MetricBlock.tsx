import { MetricMeasurement } from "@voidpulse/api";
import React from "react";

interface MetricBlockProps {
  idx: number;
  name: string;
  measurement: MetricMeasurement;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  idx,
  name,
  measurement,
}) => {
  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="text-primary-400 text-xs mr-2">{idx}</div>
        <div className="text-primary-400 text-xs">{name}</div>
      </div>
      <div className="text-primary-400 text-xs">{measurement}</div>
    </div>
  );
};
