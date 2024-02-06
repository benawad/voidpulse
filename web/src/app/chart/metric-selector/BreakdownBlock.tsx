import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import React, { useState } from "react";
import { PropKeySelector } from "./PropKeySelector";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { Metric, MetricFilter } from "./Metric";

interface BreakdownBlockProps {
  breakdown?: MetricFilter;
  onBreakdown: (f: MetricFilter) => void;
  onDelete: () => void;
}

export const BreakdownBlock: React.FC<BreakdownBlockProps> = ({
  onBreakdown,
  onDelete,
  breakdown,
}) => {
  const [{ metrics }] = useChartStateContext();
  const [isOpen, setIsOpen] = useState(!breakdown);
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
      <button
        {...getReferenceProps()}
        ref={refs.setReference}
        className="w-full text-primary-100 flex text-sm accent-hover p-2 font-semibold rounded-md"
      >
        {breakdown ? breakdown.propName : "Select property"}
      </button>
      {isOpen ? (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
        >
          <PropKeySelector
            currPropKey={breakdown?.propName}
            eventName={metrics[0].eventName}
            onPropKey={(info) => {
              onBreakdown(info as MetricFilter);
              setIsOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
