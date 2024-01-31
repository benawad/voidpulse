import React from "react";
import Downshift from "downshift";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { trpc } from "../../utils/trpc";
import { Input } from "../../ui/Input";
import { TbClick } from "react-icons/tb";

interface MetricSelectorProps {
  eventName: string;
  onEventNameChange: (eventName: string) => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  eventName,
  onEventNameChange,
}) => {
  const { projectId } = useProjectBoardContext();
  const { data } = trpc.getEventNames.useQuery({ projectId });
  return (
    <Downshift
      onChange={(selection) =>
        onEventNameChange(selection ? selection.value : "")
      }
      itemToString={(item) => (item ? item.value : "")}
      initialIsOpen
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
          {/* <label {...getLabelProps()}>Enter a fruit</label> */}
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
            {data?.names
              .filter((item) => !inputValue || item.includes(inputValue))
              .map((item, index) => (
                <div
                  {...getItemProps({
                    key: item,
                    index,
                    item: { value: item },
                  })}
                  className={
                    "flex flex-row p-2 accent-hover group rounded-md " +
                    (item === eventName
                      ? "bg-secondary-signature-100 text-primary-100"
                      : "")
                  }
                >
                  <TbClick className="mr-2 opacity-40" />
                  <div className="text-primary-200 group-hover:text-secondary-signature-100">
                    {item}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Downshift>
  );
};
