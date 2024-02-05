import React, { useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MultiToggleButtonBar } from "../ui/MultiToggleButtonBar";
import {
  DateRangePicker,
  SingleDatePicker,
  DayPickerRangeController,
  FocusedInputShape,
} from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import "./react_dates_overrides.css";
import moment from "moment";

interface ChartDateRangePickerProps {
  dateRangePicked: {
    startDate: moment.Moment | null;
    endDate: moment.Moment | null;
  };
  setDateRangePicked: (dateRange: {
    startDate: moment.Moment | null;
    endDate: moment.Moment | null;
  }) => void;
}

export const ChartDateRangePicker: React.FC<ChartDateRangePickerProps> = ({
  dateRangePicked,
  setDateRangePicked,
}) => {
  const timeUnits = ["Custom", "Today", "Yesterday", "1M", "3M", "6M", "12M"];
  const [selectedTimeUnit, setSelectedTimeUnit] = useState(timeUnits[0]);
  const [selectedTimeUnitIdx, setSelectedTimeUnitIdx] = useState(0);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusedInputShape | null>(
    null
  );
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
      {showCustomDatePicker || true ? (
        <div
          className="absolute bg-primary-900 rounded-lg border border-primary-700 p-2"
          style={{ width: 300 }}
        >
          Custom date picker goes here
          <DateRangePicker
            startDate={dateRangePicked.startDate} // momentPropTypes.momentObj or null,
            startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
            endDate={dateRangePicked.endDate} // momentPropTypes.momentObj or null,
            endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
            onDatesChange={({ startDate, endDate }) => {
              // if (startDate && endDate) {
              setDateRangePicked({ startDate, endDate });
              // }
            }}
            focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={(focusedInput) => setFocusedInput(focusedInput)} // PropTypes.func.isRequired,
          />
        </div>
      ) : null}
    </div>
  );
};
