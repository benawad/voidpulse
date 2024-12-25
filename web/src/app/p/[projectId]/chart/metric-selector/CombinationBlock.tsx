import { EventCombination, NumOperation } from "@voidpulse/api";
import React, { useState } from "react";
import { CombinationEventPicker } from "./CombinationEventPicker";
import { useChartStateContext } from "../../../../../../providers/ChartStateProvider";
import { IoClose } from "react-icons/io5";
import { SearchSelect } from "../../../../ui/SearchSelect";

interface CombinationBlockProps {
  combination: EventCombination;
  onCombination: (f: EventCombination) => void;
  onDelete: () => void;
}

export const CombinationBlock: React.FC<CombinationBlockProps> = ({
  onCombination,
  onDelete,
  combination,
}) => {
  const [{ metrics }] = useChartStateContext();

  return (
    <div className="flex flex-row gap-2 group">
      <CombinationEventPicker
        value={metrics[combination.eventIdx1]}
        options={metrics}
        onSelect={(m) => {
          onCombination({
            ...combination,
            eventIdx1: metrics.findIndex(
              (m2) => m2.event.value === m.event.value
            ),
          });
        }}
      />
      <SearchSelect
        opts={[
          {
            label: "*",
            value: NumOperation.multiply,
            searchValue: "*",
          },
          {
            label: "/",
            value: NumOperation.divide,
            searchValue: "/",
          },
        ]}
        value={combination.operation}
        onSelect={(o) => {
          onCombination({ ...combination, operation: o });
        }}
      />
      <CombinationEventPicker
        value={metrics[combination.eventIdx2]}
        options={metrics}
        onSelect={(m) => {
          onCombination({
            ...combination,
            eventIdx2: metrics.findIndex(
              (m2) => m2.event.value === m.event.value
            ),
          });
        }}
      />
      <div className="h-full justify-center items-center flex">
        <button
          className="rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-negative-100/20"
          onClick={onDelete}
        >
          <IoClose
            size={36}
            className="fill-primary-500 hover:fill-negative-100 p-2"
          />
        </button>
      </div>
    </div>
  );
};
