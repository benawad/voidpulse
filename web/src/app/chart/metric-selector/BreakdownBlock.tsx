import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import React, { useEffect, useState } from "react";
import { PropKeySelector } from "./PropKeySelector";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { Metric, MetricFilter } from "./Metric";
import { BsGrid3X3Gap } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

interface BreakdownBlockProps {
  breakdown?: MetricFilter;
  onBreakdown: (f: MetricFilter) => void;
  onDelete: () => void;
  onEmptyBreakdownAbandoned?: () => void;
}

export const BreakdownBlock: React.FC<BreakdownBlockProps> = ({
  onBreakdown,
  onDelete,
  breakdown,
  onEmptyBreakdownAbandoned,
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

  //Dismissing an empty filter block when you click outside of it
  const breakdownBlockRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (
        breakdownBlockRef.current &&
        !breakdownBlockRef.current.contains(e.target)
      ) {
        if (breakdown && Object.keys(breakdown).length !== 0) {
          return;
        }

        onEmptyBreakdownAbandoned?.();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={breakdownBlockRef}>
      <button
        {...getReferenceProps()}
        ref={refs.setReference}
        className="w-full text-primary-100 flex text-sm p-1 font-semibold rounded-md standard card flex-row group justify-between"
      >
        {/* Title and filter icon */}
        <div className="flex flex-row w-full items-center">
          <BsGrid3X3Gap className="fill-secondary-complement-100 mx-2" />
          <div className="text-sm accent-hover p-2 w-full text-left rounded-lg font-normal">
            {breakdown ? breakdown.propName : "Select property"}
          </div>
        </div>
        {/* Delete button shows up if it's an existing breakdown */}
        {breakdown ? (
          <div
            className="rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary-red-100/20"
            onClick={onDelete}
          >
            <IoClose
              size={36}
              className="fill-primary-500 hover:fill-secondary-red-100 p-2"
            />
          </div>
        ) : null}
      </button>
      {isOpen && metrics[0]?.eventName ? (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className="z-20"
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
