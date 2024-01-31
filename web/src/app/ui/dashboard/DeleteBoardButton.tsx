import React, { useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { DeleteBoardConfirmationModal } from "../../components/DeleteBoardConfirmationModal";

interface DeleteBoardButtonProps {
  onClick: () => void;
}

export const DeleteBoardButton: React.FC<DeleteBoardButtonProps> = ({
  onClick,
}) => {
  return (
    <>
      <div
        className="flex justify-start items-center p-2 rounded-lg text-secondary-red-100 group-hover:text-secondary-red-100 hover:bg-secondary-red-100/30"
        onClick={onClick}
      >
        <IoTrashOutline className="mr-2" />
        Delete
      </div>
    </>
  );
};
