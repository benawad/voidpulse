import React from "react";
import NoData from "../../../svgx/NoData";

interface NoDataToDisplayVisualProps {
  size?: string | number;
}

export const NoDataToDisplayVisual: React.FC<NoDataToDisplayVisualProps> = ({
  size = 100,
}) => {
  return <NoData width={size} height={size} />;
};
