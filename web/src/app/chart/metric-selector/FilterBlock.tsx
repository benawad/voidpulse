import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import {
  DataType,
  DateFilterOperation,
  NumberFilterOperation,
  StringFilterOperation,
} from "@voidpulse/api";
import React, { useState } from "react";
import { IoClose, IoFilter } from "react-icons/io5";
import { BooleanInput } from "../../ui/BooleanInput";
import { Dropdown } from "../../ui/Dropdown";
import { ValidatingInput } from "../../ui/ValidatingInput";
import { MetricFilter } from "./Metric";
import { PropKeySelector } from "./PropKeySelector";
import { PropValueMultiSelect } from "./PropValueMultiSelect";

interface FilterBlockProps {
  onDelete?: () => void;
  filter: Partial<MetricFilter>;
  eventName: string;
  onFilterDefined: (filter: MetricFilter) => void;
}

const isValidFilter = (
  filter: Partial<MetricFilter>
): filter is MetricFilter => {
  if (!filter.propName || !filter.propOrigin || !filter.dataType) {
    return false;
  }

  if (
    filter.dataType === DataType.boolean ||
    filter.dataType === DataType.other
  ) {
    return true;
  }

  if (!filter.operation) {
    return false;
  }

  if (
    filter.dataType === DataType.number &&
    [
      NumberFilterOperation.isNumeric,
      NumberFilterOperation.isNotNumeric,
    ].includes(filter.operation)
  ) {
    return true;
  }

  if (
    filter.dataType === DataType.number &&
    [NumberFilterOperation.between, NumberFilterOperation.notBetween].includes(
      filter.operation
    ) &&
    (Number.isNaN(parseFloat(filter.value)) ||
      Number.isNaN(parseFloat(filter.value2)))
  ) {
    return false;
  }

  if (
    filter.dataType === DataType.date &&
    [NumberFilterOperation.between, NumberFilterOperation.notBetween].includes(
      filter.operation
    ) &&
    (!filter.value || !filter.value2)
  ) {
    return false;
  }

  if (!filter.value && filter.value !== 0) {
    return false;
  }

  return true;
};

export const getOperationOptions = (
  dataType: DataType
): {
  label: string;
  value: number;
}[] => {
  if (dataType === DataType.boolean || dataType === DataType.other) {
    return [];
  }
  if (dataType === DataType.number) {
    return [
      {
        label: "Equals",
        value: NumberFilterOperation.equals,
      },
      {
        label: "Not equals",
        value: NumberFilterOperation.notEqual,
      },
      {
        label: "Greater than",
        value: NumberFilterOperation.greaterThan,
      },
      {
        label: "Less than",
        value: NumberFilterOperation.lessThan,
      },
      {
        label: "Between",
        value: NumberFilterOperation.between,
      },
      {
        label: "Not between",
        value: NumberFilterOperation.notBetween,
      },
      {
        label: "Is numeric",
        value: NumberFilterOperation.isNumeric,
      },
      {
        label: "Is not numeric",
        value: NumberFilterOperation.isNotNumeric,
      },
    ];
  }

  if (dataType === DataType.date) {
    return [
      {
        label: "On",
        value: DateFilterOperation.on,
      },
      {
        label: "Before",
        value: DateFilterOperation.before,
      },
      {
        label: "Since",
        value: DateFilterOperation.since,
      },
      {
        label: "Between",
        value: DateFilterOperation.between,
      },
      {
        label: "Not between",
        value: DateFilterOperation.notBetween,
      },
    ];
  }

  if (dataType === DataType.string) {
    return [
      {
        label: "is",
        value: StringFilterOperation.is,
      },
      {
        label: "Is not",
        value: StringFilterOperation.isNot,
      },
      {
        label: "Contains",
        value: StringFilterOperation.contains,
      },
      {
        label: "Does not contain",
        value: StringFilterOperation.notContains,
      },
      {
        label: "Is set",
        value: StringFilterOperation.isSet,
      },
      {
        label: "Is not set",
        value: StringFilterOperation.isNotSet,
      },
    ];
  }

  return [];
};

export const FilterBlock: React.FC<FilterBlockProps> = ({
  onDelete,
  filter,
  eventName,
  onFilterDefined,
}) => {
  const [localFilter, setLocalFilter] = useState<Partial<MetricFilter>>(filter);
  const setLocalOrParentFilter = (filter: Partial<MetricFilter>) => {
    if (isValidFilter(filter)) {
      onFilterDefined(filter);
    }
    setLocalFilter(filter);
  };
  // Automatically open the selector if there's no filter, otherwise keep it closed.
  const [isOpen, setIsOpen] = useState(!filter.propName);

  //Floating UI info to pass to the selector
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const options = getOperationOptions(localFilter.dataType || DataType.boolean);

  return (
    <>
      <div className="flex flex-col accent-hover items-center rounded-lg">
        <div
          className="flex flex-row group w-full justify-between items-center"
          ref={refs.setReference}
          {...getReferenceProps()}
        >
          <div className="flex flex-row">
            <IoFilter className="fill-secondary-complement-100 mx-2" />
            <div className="text-sm ml-2">
              {localFilter?.propName || "Select filter"}
            </div>
          </div>
          {/* Delete button shows up if it's an existing filter */}
          {localFilter ? (
            <div
              className="rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary-red-100/20"
              onClick={onDelete}
            >
              <IoClose
                size={36}
                className="fill-primary-500 hover:fill-secondary-red-100 p-2"
              />
            </div>
          ) : null}
        </div>

        {/* Floating UI for choosing prop name to add */}
        {isOpen ? (
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={floatingStyles}
          >
            <PropKeySelector
              currPropKey={localFilter.propName}
              eventName={eventName}
              onPropKey={(info) => {
                if (isValidFilter(info)) {
                  onFilterDefined(info);
                } else {
                  setIsOpen(false);
                  setLocalFilter(info);
                }
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Boolean filters */}
      {localFilter.propName ? (
        <div className="flex items-center">
          {localFilter.dataType === DataType.boolean ? (
            <div className="flex w-full justify-center">
              <BooleanInput
                value={localFilter.value}
                onChange={(v) => {
                  setLocalOrParentFilter({ ...localFilter, value: v });
                }}
              />
            </div>
          ) : (
            <Dropdown
              noCaret
              opts={options}
              value={localFilter.operation}
              onSelect={(op) => {
                setLocalOrParentFilter({
                  ...localFilter,
                  operation: op,
                  value:
                    localFilter.dataType === DataType.number
                      ? localFilter.value
                      : undefined,
                });
              }}
            />
          )}
          {/* Date filter here */}
          {localFilter.dataType === DataType.date &&
          localFilter.operation === DateFilterOperation.on ? (
            <div>Choose a date</div>
          ) : null}

          {/* For any string prop. Here, show multi-select for is and is-not */}
          {localFilter.dataType === DataType.string && localFilter.operation ? (
            <>
              {[StringFilterOperation.is, StringFilterOperation.isNot].includes(
                localFilter.operation
              ) ? (
                <PropValueMultiSelect
                  values={filter.value || []}
                  eventName={eventName}
                  propKey={localFilter.propName || ""}
                  onConfirm={(values) => {
                    setLocalOrParentFilter({ ...localFilter, value: values });
                  }}
                />
              ) : null}
              {[
                StringFilterOperation.contains,
                StringFilterOperation.notContains,
              ].includes(localFilter.operation) ? (
                <ValidatingInput
                  key={`${localFilter.dataType}-${localFilter.operation}`}
                  placeholder="Value..."
                  value={
                    typeof localFilter.value === "string"
                      ? localFilter.value
                      : ""
                  }
                  autoFocus
                  onBlurSubmit={(text) => {
                    if (text) {
                      setLocalOrParentFilter({ ...localFilter, value: text });
                      return true;
                    }

                    return false;
                  }}
                />
              ) : null}
            </>
          ) : null}
          {/* Number props */}
          {localFilter.dataType === DataType.number ? (
            <>
              <ValidatingInput
                key={`${localFilter.dataType}-${localFilter.operation}`}
                placeholder="Value..."
                type="number"
                className={
                  localFilter.operation === NumberFilterOperation.between ||
                  localFilter.operation === NumberFilterOperation.notBetween
                    ? "text-center"
                    : ""
                }
                value={localFilter.value}
                autoFocus
                onBlurSubmit={(text) => {
                  const value = parseFloat(text);
                  if (Number.isNaN(value)) {
                    return false;
                  } else {
                    setLocalOrParentFilter({ ...localFilter, value });
                    return true;
                  }
                }}
              />
              {/* Two inputs, for numerical between filters */}
              {localFilter.dataType === DataType.number &&
              (localFilter.operation === NumberFilterOperation.between ||
                localFilter.operation === NumberFilterOperation.notBetween) ? (
                <div className="flex items-center">
                  <div className="px-3 text-xs text-primary-400">and</div>
                  <ValidatingInput
                    placeholder="Value..."
                    type="number"
                    className="text-center"
                    value={localFilter.value2}
                    autoFocus={!!localFilter.value}
                    onBlurSubmit={(text) => {
                      const value2 = parseFloat(text);
                      if (Number.isNaN(value2)) {
                        return false;
                      } else {
                        setLocalOrParentFilter({ ...localFilter, value2 });
                        return true;
                      }
                    }}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
