import { map } from "@trpc/server/observable";
import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MultiToggleButtonBar } from "../ui/MultiToggleButtonBar";

interface DateRangePickerProps {}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({}) => {
  const timeUnits = ["Custom", "Today", "Yesterday", "1M", "3M", "6M", "12M"];
  const [selectedTimeUnit, setSelectedTimeUnit] = React.useState(timeUnits[0]);
  const [selectedTimeUnitIdx, setSelectedTimeUnitIdx] = React.useState(0);
  const buttonInfoList = timeUnits.map((unit, i) => {
    return {
      name: unit,
      action: () => {
        setSelectedTimeUnit(unit);
        setSelectedTimeUnitIdx(i);
      },
      iconLeft: unit === "Custom" ? <FaRegCalendarAlt /> : undefined,
    };
  });

  return (
    <div className="flex">
      <MultiToggleButtonBar
        className="text-xs m-2"
        buttonClassName="px-3 font-semibold"
        buttonInfo={buttonInfoList}
        selectedButtonIdx={selectedTimeUnitIdx}
      />
    </div>
  );
};
