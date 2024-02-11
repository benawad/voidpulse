import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import React, { useState } from "react";
import { IoClose, IoFilter } from "react-icons/io5";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { FloatingTooltip } from "../../ui/FloatingTooltip";
import { FloatingTrigger } from "../../ui/FloatingTrigger";
import { LineSeparator } from "../../ui/LineSeparator";
import { MeasurementSelector } from "../MeasurementSelector";
import { FilterBlock } from "./FilterBlock";
import { Metric, MetricFilter } from "./Metric";
import { MetricEvent, MetricSelector } from "./MetricSelector";

interface MetricBlockProps {
  idx: number;
  metric?: Metric | null;
  onEventChange: (e: MetricEvent) => void;
  onDelete?: () => void;
  onAddFilter?: (f: MetricFilter) => void;
  parentIsOpen?: boolean;
  setParentIsOpen?: (b: boolean) => void;
  defaultOpen?: boolean;
  showMeasurement?: boolean;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  showMeasurement = true,
  idx,
  metric,
  onEventChange,
  onDelete,
  onAddFilter,
  parentIsOpen,
  setParentIsOpen,
  defaultOpen,
}) => {
  const [, setState] = useChartStateContext();
  const [_isOpen, _setIsOpen] = useState(defaultOpen);
  const isOpen = setParentIsOpen ? parentIsOpen : _isOpen;
  const setIsOpen = setParentIsOpen ? setParentIsOpen : _setIsOpen;
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);
  const [addNewFilter, setAddNewFilter] = useState(false);
  // Needs to temporarily know the filter value before it can finalize the filter object.

  return (
    // Full metric block: label, drag handle, metric selector, and measurement.
    // Can be an empty prompting box if no metric is selected.
    // Also includes metric specific filters.
    <div
      className={`standard card p-1 my-2 group ${
        metric?.event.name ? "" : " ring-1 ring-accent-100"
      }`}
      key={idx}
    >
      {/* Top section for the event */}
      <div className="flex flex-col">
        {/* Left side of the button for the label and drag handle*/}
        <div className="flex flex-row">
          {/* Square label for the dataset letter ID */}
          <div className={"rounded-md"}>
            <div
              className="text-primary-900 flex text-sm font-bold m-2 bg-accent-100 rounded-md items-center"
              style={{
                height: 18,
                width: 18,
                textAlign: "center",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              {String.fromCharCode(idx + "A".charCodeAt(0))}
            </div>
            {/* <RxDragHandleDots2 className="mx-auto opacity-0 group-hover:opacity-100" /> */}
          </div>
          {/* Main middle section for selecting events and units */}
          <div className={`flex flex-col w-full`}>
            {/* Metric selector */}
            <div className={`flex justify-between items-center group`}>
              <button
                {...getReferenceProps()}
                ref={refs.setReference}
                className={`w-full text-primary-100 flex text-sm accent-hover p-2 font-semibold rounded-md ${
                  metric?.event.name ? "" : "text-accent-100"
                }`}
              >
                {metric?.event.name || "Select event"}
              </button>
              {/* Only show filter option if an event has been chosen */}
              {onAddFilter && metric ? (
                <FloatingTrigger
                  appearsOnHover
                  placement="top"
                  floatingContent={
                    <FloatingTooltip>
                      Add a filter to this dataset
                    </FloatingTooltip>
                  }
                >
                  <div
                    className="rounded-md opacity-0 transition-opacity group-hover:opacity-100 accent-hover"
                    onClick={() => {
                      console.log("Adding filter");
                      setAddNewFilter(true);
                    }}
                  >
                    <IoFilter
                      size={36}
                      className="fill-primary-500 hover:fill-accent-100 p-2"
                    />
                  </div>
                </FloatingTrigger>
              ) : null}
              {/* Only show delete option if an event has been chosen */}
              {onDelete ? (
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

            {/* Floating UI for choosing an event to add */}
            {/* Automatically open when the metric is empty, and closed when a metric is chosen. */}
            {isOpen ? (
              <div
                ref={refs.setFloating}
                {...getFloatingProps()}
                style={floatingStyles}
                className="z-20"
              >
                <MetricSelector
                  event={metric?.event}
                  onEventChange={(e) => {
                    setIsOpen(false);
                    onEventChange(e);
                  }}
                />
              </div>
            ) : null}
            {showMeasurement ? <MeasurementSelector metric={metric} /> : null}
          </div>
        </div>

        {/* Lower section for adding event specific filters */}
        <div>
          {metric?.filters.map((metricSpecificFilter, i) => {
            return (
              <React.Fragment key={metricSpecificFilter.id}>
                <LineSeparator className="my-0" />
                <FilterBlock
                  key={i}
                  onDelete={() => {
                    setState((prev) => ({
                      ...prev,
                      metrics: prev.metrics.map((m, j) =>
                        m.id === metric?.id
                          ? {
                              ...m,
                              filters: m.filters?.filter(
                                (f) => f.id !== metricSpecificFilter.id
                              ),
                            }
                          : m
                      ),
                    }));
                  }}
                  filter={metricSpecificFilter}
                  event={metric?.event}
                  onFilterDefined={(filter) => {
                    setState((prev) => ({
                      ...prev,
                      metrics: prev.metrics.map((m, j) =>
                        m.id === metric?.id
                          ? {
                              ...m,
                              filters: m.filters.map((f, k) =>
                                k === i ? filter : f
                              ),
                            }
                          : m
                      ),
                    }));
                  }}
                />
              </React.Fragment>
            );
          })}
          {/* Show a shell filter block if we are about to add a new filter in here: */}
          {/* Like with the Metric Block itself, once the filter is successfully added,
          hide the new filter shell and show it as part of the list above. */}
          {/* This should only be happening in an established metric block where the onAddFilter function exists.*/}
          {addNewFilter && onAddFilter ? (
            <>
              <LineSeparator />
              <FilterBlock
                filter={{}}
                onFilterDefined={(filter) => {
                  //Tell the parent to add a new filter to the metric
                  onAddFilter(filter);
                  //Hide the new filter shell
                  setAddNewFilter(false);
                }}
                onDelete={() => {
                  setAddNewFilter(false);
                }}
                event={metric?.event}
                onEmptyFilterAbandoned={() => {
                  setAddNewFilter(false);
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
