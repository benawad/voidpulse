import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { FloatingTrigger } from "./FloatingTrigger";
import { FloatingTooltip } from "./FloatingTooltip";
import { FloatingMenu } from "./FloatingMenu";
import { IoTrashOutline } from "react-icons/io5";
import { DeleteBoardButton } from "./dashboard/DeleteBoardButton";
import { DeleteBoardConfirmationModal } from "../components/DeleteBoardConfirmationModal";

interface MoreOptionsButtonProps {
  boardId: string;
  boardTitle: string;
}

export const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({
  boardId,
  boardTitle,
}) => {
  const [openConfirmationModal, setOpenConfirmationModal] =
    React.useState(false);

  return (
    <div className={"bg-transparent"}>
      <DeleteBoardConfirmationModal
        boardId={boardId}
        boardTitle={boardTitle}
        isOpen={openConfirmationModal}
        onDismissModal={() => {
          setOpenConfirmationModal(false);
        }}
      />
      {/* Outside component triggers click to open a menu */}
      <FloatingTrigger
        appearsOnClick
        hideIfOpen
        placement={"right"}
        floatingContent={
          <FloatingMenu>
            <DeleteBoardButton
              onClick={() => {
                setOpenConfirmationModal(true);
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
