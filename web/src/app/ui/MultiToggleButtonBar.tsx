import React from "react";

interface MultiToggleButtonBarProps {
  nameActionPairs: { name: string; action: () => void }[];
  selectedButtonIdx: number;
}

export const MultiToggleButtonBar: React.FC<MultiToggleButtonBarProps> = ({
  nameActionPairs,
  selectedButtonIdx,
}) => {
  console.log(selectedButtonIdx, "selectedButtonIdx");
  const defaultButtonStyle =
    "accent-hover py-2 w-full flex items-center flex flex-col text-md font-bold text-primary-200";
  return (
    <div className="rounded-full flex flex-row shadow-lg border border-primary-700">
      {nameActionPairs.map((pair, i) => {
        const isSelected = i === selectedButtonIdx;
        const isLeftmostButton = i === 0;
        const isRightmostButton = i === nameActionPairs.length - 1;
        const roundedStyle = isLeftmostButton
          ? "rounded-l-full"
          : isRightmostButton
          ? "rounded-r-full"
          : "";
        return (
          <button
            key={pair.name}
            onClick={pair.action}
            className={
              defaultButtonStyle +
              (isSelected ? " bg-primary-700 " : " bg-primary-900 ") +
              roundedStyle
            }
          >
            {pair.name}
          </button>
        );
      })}
    </div>
  );
};
