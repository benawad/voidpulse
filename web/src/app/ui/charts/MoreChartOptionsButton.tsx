import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { FloatingMenu } from "../FloatingMenu";
import { FloatingTooltip } from "../FloatingTooltip";
import { FloatingTrigger } from "../FloatingTrigger";
import { DeleteChartButton } from "./DeleteChartButton";

interface MoreChartOptionsButtonProps {
  chartId: string;
}

export const MoreChartOptionsButton: React.FC<MoreChartOptionsButtonProps> = ({
  chartId,
}) => {
  return (
    <div
      className={
        "bg-transparent hover:bg-primary-800 rounded-lg transition-colors"
      }
    >
      {/* Outside component triggers click to open a menu */}
      <FloatingTrigger
        appearsOnClick
        placement={"bottom-end"}
        portal
        hideIfOpen
        floatingContent={
          <FloatingMenu>
            <DeleteChartButton chartId={chartId} />
          </FloatingMenu>
        }
        className="flex"
      >
        {/* Inside component triggers hover to open a tooltip */}
        <FloatingTrigger
          appearsOnHover
          placement={"top"}
          portal
          floatingContent={<FloatingTooltip>More options</FloatingTooltip>}
        >
          <BsThreeDots
            className="m-auto group-hover:opacity-100 opacity-0 fill-white hover:fill-accent-100 h-full w-full transition-opacity p-2"
            size={20}
          />
        </FloatingTrigger>
      </FloatingTrigger>
    </div>
  );
};
