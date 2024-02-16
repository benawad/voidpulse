import React, { ReactElement } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FloatingMenu } from "./FloatingMenu";
import { FloatingTrigger } from "./FloatingTrigger";
import { on } from "events";

interface DropdownProps<T> {
  opts: { label: string; value: T; Icon?: ReactElement }[];
  value: T;
  onSelect: (value: T) => void;
  noCaret?: boolean;
  autoWidth?: boolean;
}

export function Dropdown<T>({
  opts,
  value,
  onSelect,
  noCaret,
  autoWidth,
}: DropdownProps<T>) {
  const chosenOption = opts.find((x) => x.value === value);
  return (
    <FloatingTrigger
      appearsOnClick
      placement={"bottom-start"}
      portal
      floatingContent={
        <FloatingMenu autoWidth={autoWidth}>
          {opts.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                onSelect(opt.value);
              }}
              className={
                "w-full flex flex-row items-center p-2 text-left accent-hover group rounded-md " +
                (opt.value === value ? "bg-accent-100 text-primary-100" : "")
              }
            >
              {opt.Icon ? <div className="mr-2">{opt.Icon}</div> : null}
              <div>{opt.label}</div>
            </button>
          ))}
        </FloatingMenu>
      }
      className="flex"
    >
      <div className="text-primary-400 text-xs accent-hover px-2 py-2 rounded-md flex items-center">
        {chosenOption?.Icon ? (
          <div className="mr-1">{chosenOption.Icon}</div>
        ) : null}
        {chosenOption?.label}
        {noCaret ? null : <IoIosArrowDown className="ml-1" />}
      </div>
    </FloatingTrigger>
  );
}
