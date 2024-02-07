import React from "react";

interface StretchySvgWrapperProps {
  viewBox?: string;
  minWidth?: string;
  maxWidth?: string;
  preserveAspectRatio?: string;
  className?: string;
}

// To use this component, set the viewBox to the size of the SVG you want to display.
// You can also set the maxWidth to make the SVG responsive.

export const StretchySvgWrapper: React.FC<
  React.PropsWithChildren<StretchySvgWrapperProps>
> = ({
  children,
  viewBox = "0 0 1200 500",
  maxWidth,
  preserveAspectRatio = "none",
  className = "",
}) => {
  return (
    <svg
      className={className}
      preserveAspectRatio={preserveAspectRatio}
      viewBox={viewBox}
      max-width={maxWidth}
    >
      {children}
    </svg>
  );
};
