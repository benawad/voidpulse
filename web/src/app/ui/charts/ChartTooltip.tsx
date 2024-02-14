import React, { useState } from "react";
import { EventEmitter } from "./useEventEmitter";
import { ChartTooltipInfo } from "../../utils/createExternalTooltipHandler";

export type TooltipData = {
  title?: string;
  subtitle?: string;
  dateString?: string;
  label?: {
    highlight?: string;
    annotation?: string;
  };
  sublabel?: {
    highlight?: string;
    annotation?: string;
  };
  percentChange?: {
    value: number;
    annotation?: string;
  };
  stripeColor?: string;
};

type Props = {
  $event: EventEmitter<ChartTooltipInfo | null>;
};

export const ChartTooltip: React.FC<Props> = ({ $event }) => {
  const [tooltipInfo, setTooltipInfo] = useState<null | ChartTooltipInfo>(null);

  $event.useSubscription((info) => {
    setTooltipInfo(info);
  });

  if (!tooltipInfo) {
    return null;
  }

  const {
    left,
    top,
    title,
    subtitle,
    dateString,
    label,
    sublabel,
    percentChange,
    stripeColor,
  } = tooltipInfo;

  return (
    <div
      className="absolute bg-primary-900 text-white p-2 rounded-lg shadow-lg z-10 transition-all"
      style={{
        pointerEvents: "none",
        left: left,
        top: top,
        borderRight: `4px solid ${stripeColor}`,
      }}
    >
      <div>{title}</div>
      <div>{subtitle}</div>
      <div>{dateString}</div>
      <div>
        {label?.highlight} {label?.annotation}
      </div>
      <div>
        {sublabel?.highlight} {sublabel?.annotation}
      </div>
      <div>
        {percentChange?.value} {percentChange?.annotation}
      </div>
    </div>
  );
};
