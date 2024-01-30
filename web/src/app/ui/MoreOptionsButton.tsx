import React from "react";
import { BsThreeDots } from "react-icons/bs";

interface MoreOptionsButtonProps {}

export const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({}) => {
  return (
    <div className={"bg-transparent"}>
      <BsThreeDots
        className="m-auto group-hover:opacity-100 opacity-0 fill-white hover:fill-secondary-signature-100 h-full w-full"
        size={20}
      />
    </div>
  );
};
