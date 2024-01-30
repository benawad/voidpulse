import React from "react";

interface LineSeparatorProps {}

export const LineSeparator: React.FC<LineSeparatorProps> = ({}) => {
  return (
    <div className="w-full bg-primary-700 my-2" style={{ height: 1 }}></div>
  );
};
