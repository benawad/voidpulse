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
import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoFilter } from "react-icons/io5";
import { BooleanInput } from "../../ui/BooleanInput";
import { Dropdown } from "../../ui/Dropdown";
import { ValidatingInput } from "../../ui/ValidatingInput";
import { MetricFilter } from "./Metric";
import { PropKeySelector } from "./PropKeySelector";
import { PropValueMultiSelect } from "./PropValueMultiSelect";
import { SingleDateValuePicker } from "./SingleDateValuePicker";
import moment from "moment";
import { MetricEvent } from "./MetricSelector";

interface FilterBlockProps {
  onDelete?: () => void;
  filter: Partial<MetricFilter>;
  event?: MetricEvent;
  onFilterDefined: (filter: MetricFilter) => void;
  onEmptyFilterAbandoned?: () => void;
}

const isValidFilter = (
  filter: Partial<MetricFilter>
): filter is MetricFilter => {
  if (!filter.prop?.value || !filter.propOrigin || !filter.dataType) {
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
    filter.dataType === DataType.string &&
    [StringFilterOperation.isSet, StringFilterOperation.isNotSet].includes(
      filter.operation
    )
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
  event,
  onFilterDefined,
  onEmptyFilterAbandoned,
}) => {
  const [localFilter, setLocalFilter] = useState<Partial<MetricFilter>>(filter);
  const setLocalOrParentFilter = (filter: Partial<MetricFilter>) => {
    if (isValidFilter(filter)) {
      onFilterDefined(filter);
    }
    setLocalFilter(filter);
  };
  // Automatically open the selector if there's no filter, otherwise keep it closed.
  const [isOpen, setIsOpen] = useState(!filter.prop?.value);

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

  //Dismissing an empty filter block when you click outside of it
  const filterBlockRef = React.useRef<HTMLInputElement>(null);
  const filterRef = useRef(filter);
  filterRef.current = filter;
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (
        filterBlockRef.current &&
        !filterBlockRef.current.contains(e.target)
      ) {
        if (Object.keys(filterRef.current).length !== 0) {
          return;
        }
        onEmptyFilterAbandoned?.();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={filterBlockRef}>
      <div className="flex flex-col items-center rounded-lg">
        <div
          className="flex flex-row group w-full justify-between items-center"
          ref={refs.setReference}
          {...getReferenceProps()}
        >
          {/* Title and filter icon */}
          <div className="flex flex-row w-full">
            <IoFilter className="fill-secondary-flair-100 mx-2 mt-2" />
            <div className="text-sm p-2 accent-hover rounded-lg w-full">
              {localFilter?.prop?.value || "Select filter"}
            </div>
          </div>
          {/* Delete button shows up if it's an existing filter */}
          {localFilter && onDelete ? (
            <button
              className="rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-negative-100/20"
              onClick={onDelete}
            >
              <IoClose
                size={36}
                className="fill-primary-500 hover:fill-negative-100 p-2"
              />
            </button>
          ) : null}
        </div>

        {/* Floating UI for choosing prop name to add */}
        {isOpen ? (
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={floatingStyles}
            className="z-20"
          >
            <PropKeySelector
              currProp={localFilter.prop}
              events={event ? [event] : []}
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

      {localFilter.prop?.value ? (
        <div className="flex items-center">
          {/* Selector for filter operation */}
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
            <div className="ml-8">
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
            </div>
          )}
          {/* Single date picker */}
          {localFilter.dataType === DataType.date &&
          localFilter.operation === DateFilterOperation.on ? (
            <SingleDateValuePicker
              value={localFilter.value}
              currentDate={moment(localFilter.value)}
              onDatePicked={(date) => {
                let dateString = moment(date).format("YYYY-MM-DD HH:mm:ss");
                console.log(dateString);
                setLocalOrParentFilter({ ...localFilter, value: dateString });
              }}
            />
          ) : null}

          {/* For any string prop. Here, show multi-select for is and is-not */}
          {localFilter.dataType === DataType.string && localFilter.operation ? (
            <>
              {[StringFilterOperation.is, StringFilterOperation.isNot].includes(
                localFilter.operation
              ) ? (
                <PropValueMultiSelect
                  values={filter.value || []}
                  event={event}
                  propKey={localFilter.prop.value || ""}
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
    </div>
  );
};
