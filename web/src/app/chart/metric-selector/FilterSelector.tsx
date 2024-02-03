import React from "react";
import { MetricFilter } from "./Metric";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { trpc } from "../../utils/trpc";
import Downshift from "downshift";
import { Input } from "../../ui/Input";
import { PulseLoader } from "../../ui/PulseLoader";

interface FilterSelectorProps {
  eventName: string;
  filter?: MetricFilter;
  onFilterChosen: (filter: MetricFilter) => void;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  filter,
  onFilterChosen,
  eventName,
}) => {
  const { projectId } = useProjectBoardContext();
  // Fetch filter props for the specific event we're filtering out
  const { data } = trpc.getPropKeys.useQuery({
    projectId,
    eventName,
  });

  return (
    <Downshift
      onChange={(selection) => {
        onFilterChosen(selection ? selection.value : "");
        console.log(selection.value);
      }}
      itemToString={(item) => (item ? item.value : "")}
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
      }) => (
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
          {data ? (
            <div
              {...getMenuProps({
                className: "overflow-auto flex-1 mt-2",
              })}
            >
              {data?.propDefs
                .filter(
                  (item) =>
                    !inputValue || Object.values(item).includes(inputValue)
                )
                .map((item, index) => (
                  <div
                    key={item.key}
                    {...getItemProps({
                      index,
                      item: { value: item },
                    })}
                    className={
                      "flex flex-row p-2 accent-hover group rounded-md " +
                      (item.key === filter?.propName
                        ? "bg-secondary-signature-100 text-primary-100"
                        : "")
                    }
                  >
                    {/* <TbClick className="mr-2 opacity-40" /> */}
                    <div className="text-primary-200 group-hover:text-secondary-signature-100">
                      {item.key}
                      {item.type}
                    </div>
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
