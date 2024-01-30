import { MetricMeasurement } from "@voidpulse/api";
import React, { useState } from "react";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { MetricSelector } from "./MetricSelector";

export type Metric = {
  name: string;
  measurement?: MetricMeasurement;
};

interface MetricBlockProps {
  idx: number;
  metric?: Metric | null;
  onEventNameChange: (eventName: string) => void;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  idx,
  metric,
  onEventNameChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="text-primary-400 text-xs mr-2">
          {String.fromCharCode(idx + "A".charCodeAt(0))}
        </div>
        <button
          {...getReferenceProps()}
          ref={refs.setReference}
          className="text-primary-400 text-xs"
        >
          {metric?.name || "Select Event"}
        </button>
        {isOpen ? (
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={floatingStyles}
          >
            <MetricSelector
              eventName={metric?.name || ""}
              onEventNameChange={(name) => {
                setIsOpen(false);
                onEventNameChange(name);
              }}
            />
          </div>
        ) : null}
      </div>
      <div className="text-primary-400 text-xs">
        {metric?.measurement || "Unique Users"}
      </div>
    </div>
  );
};
