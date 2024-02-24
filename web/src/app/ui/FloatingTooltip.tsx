import React from "react";

interface FloatingTooltipProps {}

export const FloatingTooltip: React.FC<
  React.PropsWithChildren<FloatingTooltipProps>
> = ({ children }) => {
  return (
    <div className="bg-primary-100 -mt-10 p-2 rounded-lg shadow-lg text-primary-900 text-sm z-20">
      {children}
    </div>
  );
};
