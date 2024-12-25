import React from "react";
import { SearchSelect } from "../../../../ui/SearchSelect";
import { Metric } from "./Metric";

interface CombinationEventPickerProps {
  value: Metric;
  options: Metric[];
  onSelect: (e: Metric) => void;
}

export const CombinationEventPicker: React.FC<CombinationEventPickerProps> = ({
  value,
  options,
  onSelect,
}) => {
  return (
    <SearchSelect
      opts={options.map((o) => ({
        label: o.event.name,
        value: o.event.value,
        searchValue: o.event.value,
      }))}
      value={value.event.value}
      onSelect={(e) => {
        onSelect(options.find((o) => o.event.value === e)!);
      }}
    />
  );
};
