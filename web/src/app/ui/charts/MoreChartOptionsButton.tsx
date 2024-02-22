import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { DeleteBoardButton } from "../../components/dashboard/DeleteBoardButton";
import { FloatingMenu } from "../FloatingMenu";
import { FloatingTooltip } from "../FloatingTooltip";
import { FloatingTrigger } from "../FloatingTrigger";
import { DeleteChartButton } from "./DeleteChartButton";
import { FloatingPortal } from "@floating-ui/react";

interface MoreChartOptionsButtonProps {
  chartId: string;
}

export const MoreChartOptionsButton: React.FC<
  MoreChartOptionsButtonProps
> = ({}) => {
  return (
    <div
      className={
        "bg-transparent hover:bg-primary-800 rounded-lg transition-colors"
      }
    >
      {/* Outside component triggers click to open a menu */}
      <FloatingTrigger
        appearsOnClick
        hideIfOpen
        placement={"bottom-end"}
        portal
        floatingContent={
          <FloatingMenu>
            <DeleteChartButton
              onClick={(e: any) => {
                // e.stopPropagation();
              }}
            />
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
