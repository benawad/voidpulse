import { map } from "@trpc/server/observable";
import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

interface DateRangePickerProps {}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({}) => {
  const timeUnits = ["Custom", "Today", "Yesterday", "1M", "3M", "6M", "12M"];

  return (
    <div className="flex my-2">
      <div className="flex flex-row border-primary-600 border rounded-lg">
        {timeUnits.map((unit, i) => {
          const isFirst = i === 0;
          return (
            <button
              key={i}
              className={
                (isFirst ? "border-transparent " : "border-primary-600 ") +
                "accent-hover border-l py-2 px-3 text-sm text-primary-500 flex flex-row items-center justify-center font-semibold"
              }
            >
              {isFirst ? <FaRegCalendarAlt className="mr-2" /> : null}
              {unit}
            </button>
          );
        })}
      </div>
    </div>
  );
};
