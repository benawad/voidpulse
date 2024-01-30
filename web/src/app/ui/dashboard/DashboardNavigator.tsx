import React from "react";
import { PiCaretLeftFill } from "react-icons/pi";
import config from "../../../../tailwind.config";
import { FaPlus, FaUserGroup } from "react-icons/fa6";
import { LineSeparator } from "../LineSeparator";
import { RouterOutput } from "../../utils/trpc";
import { AddBoardButton } from "../../components/AddBoardButton";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
const colors = config.theme.extend.colors;

interface DashboardNavigatorProps {
  boards: RouterOutput["getProjects"]["boards"];
}

export const DashboardNavigator: React.FC<DashboardNavigatorProps> = ({
  boards,
}) => {
  const { set } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  //PLACEHOLDER
  const isSelectedBoard = true;
  const sidebarButtonStyle =
    "accent-hover border group flex p-2 rounded-lg w-full items-center relative ";
  const selectedBoardButtonStyle = "bg-primary-700 border-primary-600/50 ";
  return (
    <div className="w-1/6 bg-primary-800 border-r border border-primary-700 flex sticky top-16">
      <div className="w-full px-2 pt-4">
        {/* Team boards button  */}
        <div className={sidebarButtonStyle + " border-transparent"}>
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
        </div>
        {/* New board button  */}
        <div className={sidebarButtonStyle + " border-transparent"}>
          <AddBoardButton />
        </div>

        <LineSeparator />
        <div className="subtext py-2">MY DASHBOARDS</div>
        {boards.map((board) => {
          return (
            <button
              onClick={() => {
                set({ lastBoardId: board.id });
              }}
              key={board.id}
              className={
                (isSelectedBoard
                  ? selectedBoardButtonStyle
                  : "border-transparent") + sidebarButtonStyle
              }
            >
              <div className="mr-2">{board.emoji}</div>
              {board.title}
              {boardId === board.id ? (
                <PiCaretLeftFill
                  fill={colors.primary[900]}
                  size={50}
                  className="absolute"
                  style={{ right: -30 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
