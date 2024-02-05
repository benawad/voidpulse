import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FloatingMenu } from "./FloatingMenu";
import { FloatingTrigger } from "./FloatingTrigger";
import { on } from "events";

interface DropdownProps<T> {
  opts: { label: string; value: T }[];
  value: T;
  onSelect: (value: T) => void;
  noCaret?: boolean;
}

export function Dropdown<T>({
  opts,
  value,
  onSelect,
  noCaret,
}: DropdownProps<T>) {
  return (
    <FloatingTrigger
      appearsOnClick
      placement={"bottom-start"}
      floatingContent={
        <FloatingMenu>
          {opts.map((opt) => (
            <div key={opt.label}>
              <button
                onClick={() => {
                  onSelect(opt.value);
                }}
                className={
                  "w-full p-2 text-left accent-hover group rounded-md " +
                  (opt.value === value
                    ? "bg-secondary-signature-100 text-primary-100"
                    : "")
                }
              >
                <div>{opt.label}</div>
              </button>
            </div>
          ))}
        </FloatingMenu>
      }
      className="flex"
    >
      <div className="text-primary-400 text-xs accent-hover px-2 py-2 rounded-md flex items-center">
        {opts.find((x) => x.value === value)?.label}
        {noCaret ? null : <IoIosArrowDown className="ml-1" />}
      </div>
    </FloatingTrigger>
  );
}
