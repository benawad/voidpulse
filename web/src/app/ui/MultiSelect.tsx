import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import Downshift from "downshift";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdOutlineIndeterminateCheckBox,
} from "react-icons/md";
import { Button } from "./Button";
import { Input } from "./Input";
import { PulseLoader } from "./PulseLoader";
import { useVirtualizer } from "@tanstack/react-virtual";

type Opt = { value: string; lowercaseValue: string; isSpecify?: boolean };

interface DropdownProps {
  opts: Opt[];
  startingValues: string[];
  isLoading?: boolean;
  onConfirm: (values: string[]) => void;
  noCaret?: boolean;
}

const formatValues = (values: string[]) => {
  if (values.length === 1) {
    return values[0];
  } else if (values.length === 2) {
    return `${values[0]} or ${values[1]}`;
  } else if (values.length === 3) {
    return `${values[0]}, ${values[1]}, or ${values[2]}`;
  } else {
    return `${values[0]}, ${values[1]}, or ${values.length - 2} more`;
  }
};

const filterOptions = (opts: Opt[], inputValue: string | null) => {
  if (!inputValue) {
    return opts;
  }
  const lowerInputValue = inputValue.toLowerCase();
  return opts.filter((item) => item.lowercaseValue.includes(lowerInputValue));
};

export function MultiSelect({
  opts,
  startingValues,
  isLoading,
  onConfirm,
  noCaret,
}: DropdownProps) {
  const [values, setValues] = useState(startingValues);
  const [isOpen, setIsOpen] = useState(!startingValues.length);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useClick(context),
  ]);
  const [sortedOpts, setSortedOpts] = useState([] as Opt[]);
  useEffect(() => {
    if (opts.length) {
      setSortedOpts(
        opts.sort((a, b) => {
          const aIsSelected = startingValues.includes(a.value);
          const bIsSelected = startingValues.includes(b.value);
          if (aIsSelected && !bIsSelected) {
            return -1;
          } else if (!aIsSelected && bIsSelected) {
            return 1;
          } else {
            return a.value.localeCompare(b.value);
          }
        })
      );
    }
  }, [opts]);

  return (
    <>
      {isOpen ? (
        <Downshift<Opt>
          onSelect={(selection, state) => {
            if (selection) {
              if (selection.value === "__all__") {
                if (!state.inputValue) {
                  if (values.length === sortedOpts.length) {
                    setValues([]);
                  } else {
                    setValues(sortedOpts.map((x) => x.value));
                  }
                } else {
                  const filteredOpts = filterOptions(
                    sortedOpts,
                    state.inputValue
                  );
                  if (filteredOpts.every((x) => values.includes(x.value))) {
                    setValues(
                      values.filter(
                        (x) => !filteredOpts.some((y) => x === y.value)
                      )
                    );
                  } else {
                    setValues(
                      Array.from(
                        new Set([
                          ...values,
                          ...filteredOpts.map((x) => x.value),
                        ])
                      )
                    );
                  }
                }
                return;
              }
              if (selection.isSpecify) {
                setSortedOpts([
                  {
                    value: selection.value,
                    lowercaseValue: selection.value.toLowerCase(),
                  },
                  ...sortedOpts,
                ]);
                setValues([...values, selection.value]);
                return;
              }
              const isSelected = values.includes(selection.value);
              if (isSelected) {
                setValues(values.filter((v) => v !== selection.value));
              } else {
                setValues([...values, selection.value]);
              }
            }
          }}
          stateReducer={(state, changes) => {
            switch (changes.type) {
              case Downshift.stateChangeTypes.blurButton:
              case Downshift.stateChangeTypes.blurInput:
                return state;
              case Downshift.stateChangeTypes.keyDownEnter:
              case Downshift.stateChangeTypes.clickItem:
                return {
                  ...changes,
                  highlightedIndex: state.highlightedIndex,
                  inputValue: state.inputValue,
                  isOpen: true,
                };
              default:
                return changes;
            }
          }}
          itemToString={(item) => (item ? item.value : "")}
          initialIsOpen
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
          }) => {
            const filteredOpts = filterOptions(sortedOpts, inputValue);
            return (
              <div
                style={floatingStyles}
                ref={refs.setFloating}
                {...getFloatingProps()}
                className="z-20"
              >
                <div
                  style={{ width: 420, height: 460 }}
                  className="bg-primary-900 border-primary-600 border shadow-xl flex flex-col p-4 rounded-md"
                >
                  {/* Search bar on top */}
                  <div
                    style={{ display: "inline-block" }}
                    className="w-full"
                    {...getRootProps({}, { suppressRefError: true })}
                  >
                    <Input
                      {...getInputProps({
                        autoFocus: true,
                        placeholder: "Search",
                      })}
                    />
                  </div>
                  {isLoading ? (
                    <PulseLoader />
                  ) : (
                    <>
                      {/* Dropdown options area */}
                      <div
                        {...getMenuProps({
                          className: "overflow-auto flex-1 mt-2",
                        })}
                      >
                        {/* Select all button at the top */}
                        {filteredOpts.length ? (
                          <div
                            {...getItemProps({
                              index: 0,
                              item: {
                                value: "__all__",
                                lowercaseValue: "__all__",
                              },
                            })}
                            className={`flex flex-row p-2 accent-hover items-center group rounded-md
                      ${
                        highlightedIndex === 0
                          ? "bg-accent-100/30 text-primary-100"
                          : ""
                      }
                      `}
                          >
                            {(!inputValue &&
                              values.length === sortedOpts.length) ||
                            (inputValue &&
                              filteredOpts.every((x) =>
                                values.includes(x.value)
                              )) ? (
                              <MdCheckBox size={24} />
                            ) : (
                              <MdOutlineIndeterminateCheckBox size={24} />
                            )}
                            <div className="ml-2 text-sm text-primary-200">
                              Select all {inputValue ? "matching" : ""}
                            </div>
                          </div>
                        ) : null}
                        {/* Rest of the dropdown options */}
                        {filteredOpts.map((item, _index) => {
                          const index = _index + 1;
                          const isSelected = values.includes(item.value);
                          return (
                            <div
                              key={item.value}
                              {...getItemProps({
                                index,
                                item,
                              })}
                              className={`flex flex-row p-2 accent-hover group rounded-md
                      ${
                        highlightedIndex === index
                          ? "bg-accent-100/30 text-primary-100"
                          : ""
                      }
                      `}
                            >
                              {isSelected ? (
                                <MdCheckBox
                                  size={24}
                                  className="fill-accent-100"
                                />
                              ) : (
                                <MdCheckBoxOutlineBlank size={24} />
                              )}
                              <div className="ml-2 text-sm text-primary-200">
                                {item.value}
                              </div>
                            </div>
                          );
                        })}
                        {inputValue &&
                        (filteredOpts.length > 10 ||
                          !filteredOpts.some((x) => x.value === inputValue)) ? (
                          <div
                            {...getItemProps({
                              index: filteredOpts.length + 1,
                              item: {
                                value: inputValue,
                                lowercaseValue: inputValue,
                                isSpecify: true,
                              },
                            })}
                            className={`flex flex-row p-2 accent-hover group rounded-md
                      ${
                        highlightedIndex === filteredOpts.length + 1
                          ? "bg-accent-100/30 text-primary-100"
                          : ""
                      }
                      `}
                          >
                            <MdCheckBoxOutlineBlank size={24} />
                            <div>Specify: {inputValue}</div>
                          </div>
                        ) : null}
                      </div>
                      <Button
                        className="mt-4"
                        onClick={() => {
                          onConfirm(values);
                          setIsOpen(false);
                        }}
                        disabled={!values.length}
                      >
                        Apply
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          }}
        </Downshift>
      ) : null}
      <button
        {...getReferenceProps()}
        ref={refs.setReference}
        className="text-primary-400 text-xs accent-hover px-2 py-2 rounded-md flex items-center"
      >
        {startingValues.length
          ? formatValues(startingValues)
          : "Select value..."}
        {noCaret ? null : <IoIosArrowDown className="ml-1" />}
      </button>
    </>
  );
}
