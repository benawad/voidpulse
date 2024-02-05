import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FloatingMenu } from "./FloatingMenu";
import { FloatingTrigger } from "./FloatingTrigger";
import { on } from "events";

interface DropdownProps {
  opts: { value: string; lowercaseValue: string }[];
  startingValues: string[];
  isLoading?: boolean;
  onConfirm: (values: string[]) => void;
  noCaret?: boolean;
}

export function MultiSelect({
  opts,
  startingValues,
  onConfirm,
  noCaret,
}: DropdownProps) {
  const [values, setValues] = useState(startingValues);

  return (
    <FloatingTrigger
      appearsOnClick
      placement={"bottom-start"}
      floatingContent={
        <FloatingMenu style={{ width: 420, height: 360 }}>
          <div className="w-full h-full overflow-auto">
            {opts.map((opt) => {
              const isSelected = values.includes(opt.value);
              return (
                <div className="w-full" key={opt.value}>
                  <button
                    onClick={() => {
                      if (isSelected) {
                        setValues(values.filter((x) => x !== opt.value));
                      } else {
                        setValues([...values, opt.value]);
                      }
                    }}
                    className={
                      "w-full p-2 text-left accent-hover group rounded-md " +
                      (isSelected
                        ? "bg-secondary-signature-100 text-primary-100"
                        : "")
                    }
                  >
                    <div className="truncate overflow-hidden text-ellipsis w-full">
                      {opt.value}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </FloatingMenu>
      }
      className="flex"
    >
      <div className="text-primary-400 text-xs accent-hover px-2 py-2 rounded-md flex items-center">
        {values.length ? values.join(", ") : "Select value..."}
        {noCaret ? null : <IoIosArrowDown className="ml-1" />}
      </div>
    </FloatingTrigger>
  );
}
