import React from "react";

interface LineSeparatorProps {
  className?: string;
}

export const LineSeparator: React.FC<LineSeparatorProps> = ({ className }) => {
  return (
    <div
      className={`w-full bg-primary-700 my-2 ${className}`}
      style={{ height: 1 }}
    ></div>
  );
};
