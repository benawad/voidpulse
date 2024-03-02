import Downshift from "downshift";
import { ReactElement, useState } from "react";
import { TbClick } from "react-icons/tb";
import { Input } from "./Input";
import { IoIosArrowDown } from "react-icons/io";
import { HiSelector } from "react-icons/hi";

interface DropdownProps<T> {
  opts: {
    label: string;
    value: T;
    searchValue: string;
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

export function SearchSelect<T>({
  opts,
  value,
  onSelect,
  buttonClassName,
  noCaret,
  upAndDownCaret,
}: DropdownProps<T>) {
  const chosenOption = opts.find((o) => o.value === value);

  return (
    <Downshift<{
      label: string;
      value: T;
      Icon?: ReactElement;
      optClassName?: string;
    }>
      onChange={(selection) => {
        if (selection) {
          onSelect(selection.value);
        }
      }}
      itemToString={(item) => (item ? item.label : "")}
      defaultHighlightedIndex={0}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
        openMenu,
      }) => {
        if (!isOpen) {
          return (
            <button
              className={
                (buttonClassName
                  ? buttonClassName
                  : `text-primary-400 text-xs accent-hover`) +
                ` px-2 py-2 rounded-md flex items-center`
              }
              onClick={() => openMenu()}
            >
              {chosenOption?.Icon ? (
                <div className="mr-1">{chosenOption.Icon}</div>
              ) : null}
              {chosenOption?.label}
              {noCaret ? null : <IoIosArrowDown className="ml-1" />}
              {upAndDownCaret ? (
                <HiSelector className="opacity-50 ml-1" size={16} />
              ) : null}
            </button>
          );
        }

        const filterValue = inputValue?.toLowerCase();

        return (
          <div
            style={{ width: 420, height: 360 }}
            className="bg-primary-900 border-primary-600 border shadow-xl flex flex-col p-4 rounded-md"
          >
            <div
              style={{ display: "inline-block" }}
              className="w-full"
              {...getRootProps({}, { suppressRefError: true })}
            >
              <Input {...getInputProps({ autoFocus: true })} />
            </div>

            {/* Shows the list of event names */}
            <div
              {...getMenuProps({
                className: "overflow-auto flex-1 mt-2",
              })}
            >
              {opts
                .filter(
                  (item) =>
                    !filterValue ||
                    (item.searchValue || item.label).includes(filterValue)
                )
                .map((item, index) => (
                  <div
                    key={item.label}
                    {...getItemProps({
                      index,
                      item,
                    })}
                    className={`flex flex-row p-2 accent-hover group rounded-md
                      ${
                        item.value === value
                          ? "bg-accent-100 text-primary-100"
                          : ""
                      }
                      ${
                        highlightedIndex === index
                          ? "bg-accent-100/30 text-primary-100"
                          : ""
                      }
                      `}
                  >
                    <TbClick className="mr-2 opacity-40" />
                    <div>{item.label}</div>
                  </div>
                ))}
            </div>
          </div>
        );
      }}
    </Downshift>
  );
}
