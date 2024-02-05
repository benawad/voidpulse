import React from "react";
import "react-dates/initialize";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MultiToggleButtonBar } from "../ui/MultiToggleButtonBar";

interface ChartDateRangePickerProps {}

export const ChartDateRangePicker: React.FC<
  ChartDateRangePickerProps
> = ({}) => {
  const timeUnits = ["Custom", "Today", "Yesterday", "1M", "3M", "6M", "12M"];
  const [selectedTimeUnit, setSelectedTimeUnit] = React.useState(timeUnits[0]);
  const [selectedTimeUnitIdx, setSelectedTimeUnitIdx] = React.useState(0);
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
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
    <div
      className="flex"
      onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
    >
      <MultiToggleButtonBar
        className="text-xs m-2"
        buttonClassName="px-3 font-semibold"
        buttonInfo={buttonInfoList}
        selectedButtonIdx={selectedTimeUnitIdx}
      />
      {showCustomDatePicker ? (
        <div
          className="absolute bg-primary-900 rounded-lg border border-primary-700 p-2"
          style={{ width: 300 }}
        >
          Custom date picker goes here
        </div>
      ) : null}
    </div>
  );
};
