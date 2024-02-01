import React from "react";

interface MultiToggleButtonBarProps {
  buttonInfo: {
    name: string;
    action: () => void;
    iconLeft?: React.JSX.Element;
  }[];
  selectedButtonIdx: number;
  className?: string;
  buttonClassName?: string;
}

export const MultiToggleButtonBar: React.FC<MultiToggleButtonBarProps> = ({
  buttonInfo,
  selectedButtonIdx,
  className = "",
  buttonClassName = "",
}) => {
  console.log(selectedButtonIdx, "selectedButtonIdx");
  const defaultButtonStyle = `accent-hover py-2 items-center text-primary-200 ${buttonClassName}`;
  return (
    <div
      className={`rounded-full flex flex-row shadow-lg border border-primary-700 ${className}`}
    >
      {buttonInfo.map((button, i) => {
        const isSelected = i === selectedButtonIdx;
        const isLeftmostButton = i === 0;
        const isRightmostButton = i === buttonInfo.length - 1;
        const roundedStyle = isLeftmostButton
          ? "rounded-l-full"
          : isRightmostButton
          ? "rounded-r-full"
          : "";
        return (
          <button
            key={button.name}
            onClick={button.action}
            className={
              defaultButtonStyle +
              (isSelected ? " bg-primary-700 " : " bg-primary-900 ") +
              roundedStyle
            }
          >
            {button.name}
          </button>
        );
      })}
    </div>
  );
};
