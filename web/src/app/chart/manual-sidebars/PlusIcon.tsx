import React from "react";
import { FaPlus } from "react-icons/fa6";

interface PlusIconProps {}

export const PlusIcon: React.FC<PlusIconProps> = ({}) => {
  return (
    <div className="w-6 h-6 rounded-md mr-3">
      <FaPlus
        className="m-auto group-hover:fill-accent-100 h-full w-full"
        style={{ padding: 5 }}
        size={12}
      />
    </div>
  );
};
