import { MetricMeasurement } from "@voidpulse/api";
import React, { useState } from "react";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { MetricSelector } from "./MetricSelector";
import { IoIosArrowDown } from "react-icons/io";

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
    <div className="card py-1 px-3">
      <div className="flex flex-row">
        {/* Left side of the button for the label and drag handle*/}
        <div className="cursor-grab">
          {/* Square label for the dataset letter ID */}
          <div
            className="text-primary-900 flex text-sm font-bold mr-2 bg-secondary-signature-100 rounded-md items-center"
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
        </div>
        {/* Main middle section for choosing events and units */}
        <div className="flex flex-col w-full">
          {/* Metric selector */}
          <button
            {...getReferenceProps()}
            ref={refs.setReference}
            className="w-full text-primary-100 flex text-sm accent-hover p-2 font-semibold rounded-md"
          >
            {metric?.name || "Select event"}
          </button>
          {/* Floating UI for choosing metric to add */}
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
          {/* Metric measurement */}
          <div className="text-primary-200 text-xs accent-hover px-2 py-1 rounded-md flex items-center">
            {metric?.measurement || "Unique users"}
            <IoIosArrowDown className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
