import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { FloatingTrigger } from "./FloatingTrigger";
import { FloatingTooltip } from "./FloatingTooltip";
import { FloatingMenu } from "./FloatingMenu";

interface MoreOptionsButtonProps {}

export const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({}) => {
  const derp = <div></div>;
  return (
    <div className={"bg-transparent"}>
      {/* Outside component triggers click to open a menu */}
      <FloatingTrigger
        appearsOnClick
        hideIfOpen
        placement={"right"}
        floatingContent={<FloatingMenu>Delete</FloatingMenu>}
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
