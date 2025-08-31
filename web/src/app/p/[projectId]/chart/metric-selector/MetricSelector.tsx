import React, { useMemo } from "react";
import Downshift from "downshift";
import { useProjectBoardContext } from "../../../../../../providers/ProjectBoardProvider";
import { trpc } from "../../../../utils/trpc";
import { Input } from "../../../../ui/Input";
import { TbClick } from "react-icons/tb";
import { PulseLoader } from "../../../../ui/PulseLoader";
import { useChartStateContext } from "../../../../../../providers/ChartStateProvider";
import { ReportType } from "@voidpulse/api";

export type MetricEvent = {
  name: string;
  value: string;
};

interface MetricSelectorProps {
  event?: MetricEvent;
  onEventChange: (e: MetricEvent) => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  event,
  onEventChange,
}) => {
  const { projectId } = useProjectBoardContext();
  const { data } = trpc.getEventNames.useQuery({ projectId });
  const [{ reportType }] = useChartStateContext();
  const dataWithAutocompleteKey = useMemo(() => {
    if (data) {
      const items: {
        name: string;
        value: string;
        lowercaseName: string;
      }[] = data.items.map((x) => ({
        name: x.name,
        value: x.value,
        lowercaseName: x.name.toLowerCase(),
      }));
      if (reportType === ReportType.insight) {
        items.push({
          name: "All Events",
          value: "$*",
          lowercaseName: "all events",
        });
      } else if (reportType === ReportType.retention) {
        items.push({
          name: "Any event",
          value: "$*",
          lowercaseName: "any event",
        });
      }
      return {
        items,
      };
    }
    return null;
  }, [data, reportType]);

  return (
    <Downshift<NonNullable<typeof dataWithAutocompleteKey>["items"][0]>
      onChange={(selection) => {
        if (selection) {
          onEventChange(selection);
        }
      }}
      itemToString={(item) => (item ? item.name : "")}
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
      }) => (
        <div
          style={{ width: 420, height: 360 }}
          className="bg-primary-900 border-primary-600 border shadow-xl flex flex-col p-4 rounded-md"
        >
          <div
            style={{ display: "inline-block" }}
            className="w-full"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input
              {...getInputProps({ autoFocus: true, "data-lpignore": "true" })}
            />
          </div>

          {/* Shows the list of event names */}
          {data ? (
            <div
              {...getMenuProps({
                className: "overflow-auto flex-1 mt-2",
              })}
            >
              {dataWithAutocompleteKey?.items
                .filter(
                  (item) =>
                    !inputValue ||
                    item.lowercaseName.includes(inputValue.toLowerCase())
                )
                .map((item, index) => (
                  <div
                    key={item.name}
                    {...getItemProps({
                      index,
                      item,
                    })}
                    className={`flex flex-row p-2 accent-hover group rounded-md
                      ${
                        item.value === event?.value
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
                    <div>{item.name}</div>
                  </div>
                ))}
            </div>
          ) : (
            <PulseLoader pulseType="list" />
          )}
        </div>
      )}
    </Downshift>
  );
};
