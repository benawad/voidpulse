import React from "react";
import { IoTrashOutline } from "react-icons/io5";

interface DeleteChartButtonProps {
  onClick: (e: any) => void;
}

export const DeleteChartButton: React.FC<DeleteChartButtonProps> = ({
  onClick,
}) => {
  return (
    <div
      className="flex justify-start items-center p-2 rounded-lg text-negative-100 group-hover:text-negative-100 hover:bg-negative-100/30"
      onClick={onClick}
    >
      <IoTrashOutline className="mr-2" />
      Delete
    </div>
  );
};
