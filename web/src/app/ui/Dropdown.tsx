import React, { ReactElement } from "react";
import { IoIosArrowDown, IoIosCheckmark } from "react-icons/io";
import { FloatingMenu } from "./FloatingMenu";
import { FloatingTrigger } from "./FloatingTrigger";
import { on } from "events";
import { HiSelector } from "react-icons/hi";

interface DropdownProps<T> {
  opts: {
    label: string;
    value: T;
    Icon?: ReactElement;
    optClassName?: string;
  }[];
  value: T;
  onSelect: (value: T) => void;
  noCaret?: boolean;
  upAndDownCaret?: boolean;
  showCheckmark?: boolean;
  autoWidth?: boolean;
  portal?: boolean;
  menuClassName?: string;
  buttonClassName?: string;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
}

export function Dropdown<T>({
  opts,
  value,
  onSelect,
  noCaret,
  upAndDownCaret,
  showCheckmark,
  autoWidth,
  portal = true,
  menuClassName,
  buttonClassName,
  placement = "bottom-start",
}: DropdownProps<T>) {
  const chosenOption = opts.find((x) => x.value === value);
  return (
    <FloatingTrigger
      appearsOnClick
      placement={placement}
      portal={portal}
      floatingContent={
        <FloatingMenu autoWidth={autoWidth} className={menuClassName}>
          {/* This part is the dropdown menu itself*/}
          {opts.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                onSelect(opt.value);
              }}
              className={
                `w-full flex flex-row items-center p-2 text-left accent-hover group rounded-md justify-between ` +
                (opt.value === value ? "bg-accent-100 text-primary-100" : "") +
                (opt.optClassName ? ` ${opt.optClassName}` : "")
              }
            >
              <div className="flex flex-row justify-start">
                {opt.Icon ? <div className="mr-2">{opt.Icon}</div> : null}
                <span>{opt.label}</span>
              </div>
              {showCheckmark && opt.value === value ? (
                <IoIosCheckmark size={24} />
              ) : null}
            </button>
          ))}
        </FloatingMenu>
      }
      className="flex"
    >
      {/* Inside component that you click on to open the dropdown menu*/}
      <div
        className={
          (buttonClassName
            ? buttonClassName
            : `text-primary-400 text-xs accent-hover`) +
          ` px-2 py-2 rounded-md flex items-center`
        }
      >
        {chosenOption?.Icon ? (
          <div className="mr-1">{chosenOption.Icon}</div>
        ) : null}
        {chosenOption?.label}
        {noCaret ? null : <IoIosArrowDown className="ml-1" />}
        {upAndDownCaret ? (
          <HiSelector className="opacity-50 ml-1" size={16} />
        ) : null}
      </div>
    </FloatingTrigger>
  );
}
