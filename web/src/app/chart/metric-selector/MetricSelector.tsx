import React, { useMemo } from "react";
import Downshift from "downshift";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { trpc } from "../../utils/trpc";
import { Input } from "../../ui/Input";
import { TbClick } from "react-icons/tb";
import { PulseLoader } from "../../ui/PulseLoader";

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
  const dataWithAutocompleteKey = useMemo(() => {
    if (data) {
      return {
        items: data.items.map((x) => ({
          name: x.name,
          lowercaseName: x.name.toLowerCase(),
        })),
      };
    }
    return null;
  }, [data]);

  return (
    <Downshift<NonNullable<typeof dataWithAutocompleteKey>["items"][0]>
      onChange={(selection) =>
        onEventNameChange(selection ? selection.name : "")
      }
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
            <Input {...getInputProps({ autoFocus: true })} />
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
                        item.name === eventName
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
