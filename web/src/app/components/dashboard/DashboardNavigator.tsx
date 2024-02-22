import React, { useEffect, useState } from "react";
import { PiCaretLeftFill } from "react-icons/pi";
import { FaPlus, FaUserGroup } from "react-icons/fa6";
import { LineSeparator } from "../../ui/LineSeparator";
import { RouterOutput } from "../../utils/trpc";
import { AddBoardButton } from "./AddBoardButton";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { DashboardSidebarButton } from "./DashboardSidebarButton";
import { useKeyPress } from "../../utils/useKeyPress";

interface DashboardNavigatorProps {
  boards: RouterOutput["getProjects"]["boards"];
}

export const DashboardNavigator: React.FC<DashboardNavigatorProps> = ({
  boards,
}) => {
  const { boardId } = useProjectBoardContext();
  const { set } = useLastSelectedProjectBoardStore();

  //Keyboard navigation
  useKeyPress({
    onLeftArrowKey() {
      const index = boards.findIndex((b) => b.id === boardId);
      if (index) {
        set({ lastBoardId: boards[index - 1].id });
      }
    },
    onRightArrowKey() {
      const index = boards.findIndex((b) => b.id === boardId);
      if (index < boards.length - 1) {
        set({ lastBoardId: boards[index + 1].id });
      }
    },
  });

  //Styling buttons
  const sidebarButtonStyle =
    "accent-hover ring-0 group flex p-2 rounded-lg w-full items-center relative ";
  const selectedBoardButtonStyle = "bg-primary-700 ring-primary-600/50 ";
  return (
    <div
      className="w-1/6 bg-primary-800 border-r border border-primary-700 flex sticky top-16 h-full"
      style={{ minWidth: 200 }}
    >
      <div className="w-full px-2 pt-4">
        {/* Team boards button  */}
        {/* <div className={sidebarButtonStyle + " border-transparent"}>
          <div className="flex items-center">
            <div className={"icon-box"}>
              <FaUserGroup
                className="m-auto group-hover:fill-white h-full w-full"
                style={{ padding: 5 }}
                size={12}
              />
            </div>
            Team boards
          </div>
        </div> */}
        {/* New board button  */}
        <div className={sidebarButtonStyle + " border-transparent"}>
          <AddBoardButton />
        </div>

        <LineSeparator />
        <div className="subtext py-2">MY BOARDS</div>
        {boards.map((board) => {
          return <DashboardSidebarButton key={board.id} board={board} />;
        })}
      </div>
    </div>
  );
};
