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
  const defaultButtonStyle = `accent-hover flex flex-row py-2 items-center text-primary-200 overflow-hidden ${buttonClassName}`;
  return (
    <div
      className={`rounded-full flex flex-row shadow-lg border border-primary-700 overflow-hidden ${className}`}
    >
      {buttonInfo.map((button, i) => {
        const isSelected = i === selectedButtonIdx;
        const isLeftmostButton = i === 0;
        const isRightmostButton = i === buttonInfo.length - 1;
        const roundedStyle = isLeftmostButton
          ? "rounded-l-full"
          : isRightmostButton
          ? ""
          : "";
        return (
          <button
            key={button.name}
            onClick={button.action}
            className={
              defaultButtonStyle +
              (isSelected
                ? " bg-primary-700 text-primary-100"
                : " bg-primary-900 text-primary-500") +
              roundedStyle
            }
          >
            {button.iconLeft ? (
              <div className="mr-2 my-auto h-full">{button.iconLeft}</div>
            ) : null}
            {button.name}
          </button>
        );
      })}
    </div>
  );
};
