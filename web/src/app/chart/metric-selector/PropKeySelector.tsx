import React, { useMemo } from "react";
import { MetricFilter } from "./Metric";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { RouterOutput, trpc } from "../../utils/trpc";
import Downshift from "downshift";
import { Input } from "../../ui/Input";
import { PulseLoader } from "../../ui/PulseLoader";
import {
  DataType,
  DateFilterOperation,
  NumberFilterOperation,
  PropOrigin,
  StringFilterOperation,
} from "@voidpulse/api";
import { genId } from "../../utils/genId";

interface FilterSelectorProps {
  eventName: string;
  currPropKey?: string;
  onPropKey: (filter: Partial<MetricFilter>) => void;
}

export const PropKeySelector: React.FC<FilterSelectorProps> = ({
  onPropKey,
  eventName,
  currPropKey,
}) => {
  const { projectId } = useProjectBoardContext();
  // Fetch filter props for the specific event we're filtering out
  const { data, isLoading } = trpc.getPropKeys.useQuery({
    projectId,
    eventName,
  });
  const dataWithAutocompleteKey = useMemo(() => {
    if (data) {
      return {
        items: data.propDefs.map((x) => ({
          ...x,
          lowercaseKey: x.key.toLowerCase(),
        })),
      };
    }
    return null;
  }, [data]);

  return (
    <Downshift<NonNullable<typeof dataWithAutocompleteKey>["items"][0]>
      onChange={(selection) => {
        if (selection) {
          onPropKey({
            id: genId(),
            propName: selection.key,
            propOrigin: selection.propOrigin,
            dataType: selection.type,
            operation: {
              [DataType.string]: StringFilterOperation.is,
              [DataType.number]: NumberFilterOperation.equals,
              [DataType.date]: DateFilterOperation.on,
              [DataType.boolean]: undefined,
              [DataType.other]: undefined,
            }[selection.type],
            value: selection.type === DataType.boolean ? true : undefined,
          });
        }
      }}
      itemToString={(item) => (item ? item.key : "")}
      defaultHighlightedIndex={0}
      initialIsOpen
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
      }) => {
        return (
          <div
            style={{ width: 420, height: 360 }}
            className="bg-primary-900 border-primary-600 border shadow-xl flex flex-col p-4 rounded-md"
          >
            {/* Search bar at the top */}
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
              {isLoading ? <PulseLoader pulseType="list" /> : null}
              {dataWithAutocompleteKey?.items
                .filter(
                  (item) =>
                    !inputValue ||
                    item.lowercaseKey.includes(inputValue.toLowerCase())
                )
                .map((item, index) => (
                  <div
                    key={item.key}
                    {...getItemProps({
                      index,
                      item,
                    })}
                    className={`flex flex-row p-2 accent-hover group rounded-md
                    ${
                      item.key === currPropKey
                        ? "bg-secondary-signature-100 text-primary-100"
                        : ""
                    }
                    ${
                      highlightedIndex === index
                        ? "bg-secondary-signature-100/30 text-primary-100"
                        : ""
                    }
                    `}
                  >
                    {/* <TbClick className="mr-2 opacity-40" /> */}
                    <div className="text-primary-200 group-hover:text-secondary-signature-100">
                      {item.key}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      }}
    </Downshift>
  );
};
