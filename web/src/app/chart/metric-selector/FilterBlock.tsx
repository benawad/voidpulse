import React, { useState } from "react";
import { IoClose, IoFilter } from "react-icons/io5";
import { MetricFilter } from "./Metric";
import { FilterSelector } from "./FilterSelector";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";

interface FilterBlockProps {
  onDelete?: () => void;
  onFilterChosen: (filter: MetricFilter) => void;
  filter?: MetricFilter;
  eventName: string;
}

export const FilterBlock: React.FC<FilterBlockProps> = ({
  onDelete,
  onFilterChosen,
  filter,
  eventName,
}) => {
  // Automatically open the selector if there's no filter, otherwise keep it closed.
  const [isOpen, setIsOpen] = useState(!filter);
  //Floating UI info to pass to the selector
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
    <div className="flex accent-hover items-center rounded-lg">
      <div
        className="flex flex-row group w-full justify-between items-center"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div className="flex flex-row">
          <IoFilter className="fill-secondary-complement-100 mx-2" />
          <div className="text-sm ml-2">
            {filter?.propName || "Select filter"}
          </div>
        </div>
        {/* Delete button shows up if it's an existing filter */}
        {filter ? (
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
      </div>

      {/* Floating UI for choosing metric to add */}
      {isOpen ? (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
        >
          <FilterSelector
            eventName={eventName}
            onFilterChosen={(filter) => {
              setIsOpen(false);
              onFilterChosen(filter);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
