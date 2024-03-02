import { ChartTimeRangeType, LineChartGroupByTimeType } from "@voidpulse/api";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { DateRangePicker, FocusedInputShape } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useChartStateContext } from "../../../../../providers/ChartStateProvider";
import { MultiToggleButtonBar } from "../../../ui/MultiToggleButtonBar";
import "./react_dates_overrides.css";

interface ChartDateRangePickerProps {}

const timeUnits = [
  { label: "Custom", value: ChartTimeRangeType.Custom },
  { label: "Today", value: ChartTimeRangeType.Today },
  { label: "Yesterday", value: ChartTimeRangeType.Yesterday },
  { label: "7D", value: ChartTimeRangeType["7D"] },
  { label: "30D", value: ChartTimeRangeType["30D"] },
  { label: "3M", value: ChartTimeRangeType["3M"] },
  { label: "6M", value: ChartTimeRangeType["6M"] },
  { label: "12M", value: ChartTimeRangeType["12M"] },
];

export const ChartDateRangePicker: React.FC<
  ChartDateRangePickerProps
> = ({}) => {
  const [{ from, to, timeRangeType }, setState] = useChartStateContext();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [localTimeUnit, setLocalTimeUnit] = useState(timeRangeType);
  const [focusedInput, setFocusedInput] = useState<FocusedInputShape | null>(
    "startDate"
  );
  const [localDateRange, setLocalDateRange] = useState({
    startDate: from || null,
    endDate: to || null,
  });
  const today = moment();
  const isToday = (day: moment.Moment) => today.isSame(day, "day");
  const dateRangeAsString = (dateRange: {
    startDate: moment.Moment;
    endDate: moment.Moment;
  }) => {
    return `${dateRange.startDate.format(
      "MMM D, YYYY"
    )} - ${dateRange.endDate.format("MMM D, YYYY")}`;
  };

  const buttonInfoList = timeUnits.map((unit, i) => {
    if (unit.value === ChartTimeRangeType.Custom) {
      return {
        name:
          from && to
            ? dateRangeAsString({
                startDate: from,
                endDate: to,
              })
            : "Custom",
        action: () => {
          setLocalTimeUnit(unit.value);
          setShowCustomDatePicker(true);
        },
        iconLeft: <FaRegCalendarAlt />,
      };
    } else {
      return {
        name: unit.label,
        action: () => {
          setLocalTimeUnit(unit.value);

          setState((prev) => ({
            ...prev,
            from: undefined,
            to: undefined,
            timeRangeType: unit.value,
            lineChartGroupByTimeType: {
              [ChartTimeRangeType.Today]: LineChartGroupByTimeType.day,
              [ChartTimeRangeType.Yesterday]: LineChartGroupByTimeType.day,
              [ChartTimeRangeType["7D"]]: LineChartGroupByTimeType.day,
              [ChartTimeRangeType["30D"]]: LineChartGroupByTimeType.day,
              [ChartTimeRangeType["3M"]]: LineChartGroupByTimeType.week,
              [ChartTimeRangeType["6M"]]: LineChartGroupByTimeType.month,
              [ChartTimeRangeType["12M"]]: LineChartGroupByTimeType.month,
              [ChartTimeRangeType.Custom]: prev.lineChartGroupByTimeType,
            }[unit.value],
          }));
        },
      };
    }
  });

  //Dismissing the custom date picker when you click outside of it
  const datePickerRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCustomDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="flex">
      <MultiToggleButtonBar
        className="text-xs m-2"
        buttonClassName="px-3 font-semibold"
        buttonInfo={buttonInfoList}
        selectedButtonIdx={timeUnits.findIndex(
          (x) => x.value === localTimeUnit
        )}
      />
      {showCustomDatePicker ? (
        <div
          className="absolute bg-primary-900 rounded-lg border border-primary-700 p-2"
          ref={datePickerRef}
        >
          <DateRangePicker
            startDate={localDateRange.startDate} // momentPropTypes.momentObj or null,
            startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
            endDate={localDateRange.endDate} // momentPropTypes.momentObj or null,
            endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
            displayFormat="MMM D, YYYY"
            onDatesChange={({ startDate, endDate }) => {
              setLocalDateRange({ startDate, endDate });
            }}
            onClose={({ startDate, endDate }) => {
              if (startDate && endDate) {
                let lineChartGroupByTimeType = LineChartGroupByTimeType.day;
                const daysDiff = endDate.diff(startDate, "days");
                if (daysDiff > 93) {
                  lineChartGroupByTimeType = LineChartGroupByTimeType.month;
                } else if (daysDiff > 31) {
                  lineChartGroupByTimeType = LineChartGroupByTimeType.week;
                }
                setState((prev) => ({
                  ...prev,
                  from: startDate,
                  to: endDate,
                  timeRangeType: ChartTimeRangeType.Custom,
                  lineChartGroupByTimeType,
                }));
                setShowCustomDatePicker(false);
              }
            }}
            focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={(focusedInput) => {
              setFocusedInput(focusedInput);
            }}
            noBorder
            small
            numberOfMonths={1}
            hideKeyboardShortcutsPanel
            minimumNights={0}
            isOutsideRange={(day) => day.isAfter(today)}
            renderDayContents={(day) => (
              <div
                className={
                  isToday(day) ? "font-bold text-primary-100 underline" : ""
                }
                style={{
                  opacity: day.isAfter(today) ? 0.5 : 1,
                }}
              >
                {day.format("D")}
              </div>
            )}
          />
        </div>
      ) : null}
    </div>
  );
};
