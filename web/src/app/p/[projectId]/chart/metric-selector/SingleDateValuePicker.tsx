import React, { useEffect, useState } from "react";
import { SingleDatePicker } from "react-dates";
import moment from "moment";

interface SingleDateValuePickerProps {
  value?: any;
  currentDate: moment.Moment;
  onDatePicked: (date: moment.Moment) => void;
}

export const SingleDateValuePicker: React.FC<SingleDateValuePickerProps> = ({
  value,
  currentDate,
  onDatePicked,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  //Dismissing the custom date picker when you click outside of it
  const datePickerRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div>
      {isOpen ? (
        <div className="absolute ml-1 -m-4" ref={datePickerRef}>
          <SingleDatePicker
            date={currentDate}
            onDateChange={(date) => {
              if (date) {
                onDatePicked(date);
                setIsOpen(false);
              }
            }}
            focused={true}
            onFocusChange={({ focused }) => false}
            id="single_date_picker"
            noBorder
            small
            numberOfMonths={1}
            hideKeyboardShortcutsPanel
            isOutsideRange={() => false}
            displayFormat="MMM D, YYYY"
          />
        </div>
      ) : (
        <button
          className="accent-hover w-full rounded-md text-xs p-2 text-primary-400"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {value ? currentDate.format("MMM D, YYYY") : "Select date"}
        </button>
      )}
    </div>
  );
};
