import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { FloatingTrigger } from "./FloatingTrigger";
import { FloatingTooltip } from "./FloatingTooltip";
import { FloatingMenu } from "./FloatingMenu";
import { IoTrashOutline } from "react-icons/io5";

interface MoreOptionsButtonProps {}

export const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({}) => {
  return (
    <div className={"bg-transparent"}>
      {/* Outside component triggers click to open a menu */}
      <FloatingTrigger
        appearsOnClick
        hideIfOpen
        placement={"right"}
        floatingContent={
          <FloatingMenu>
            <div className="flex justify-between items-center p-2 rounded-lg text-secondary-red-100 group-hover:text-secondary-red-100 hover:bg-secondary-red-100/30">
              Delete
              <IoTrashOutline />
            </div>
          </FloatingMenu>
        }
        className="flex"
      >
        {/* Inside component triggers hover to open a tooltip */}
        <FloatingTrigger
          appearsOnHover
          placement={"top"}
          floatingContent={<FloatingTooltip>More options</FloatingTooltip>}
        >
          <BsThreeDots
            className="m-auto group-hover:opacity-100 opacity-0 fill-white hover:fill-secondary-signature-100 h-full w-full"
            size={20}
          />
        </FloatingTrigger>
      </FloatingTrigger>
    </div>
  );
};
