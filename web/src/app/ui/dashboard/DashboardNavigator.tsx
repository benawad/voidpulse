import React from "react";
import { PiCaretLeftFill } from "react-icons/pi";
import config from "../../../../tailwind.config";
import { FaPlus, FaUserGroup } from "react-icons/fa6";
import { LineSeparator } from "../LineSeparator";
const colors = config.theme.extend.colors;

interface DashboardNavigatorProps {
  project?: any;
}

export const DashboardNavigator: React.FC<DashboardNavigatorProps> = ({
  project,
}) => {
  //PLACEHOLDER
  const isSelectedBoard = true;
  const sidebarButtonStyle =
    "accent-hover border group flex p-2 rounded-lg w-full items-center relative ";
  const iconBoxStyle =
    "accent-hover group-hover:bg-secondary-signature-100 bg-primary-600 w-6 h-6 rounded-md mr-3 ";
  const selectedBoardButtonStyle = "bg-primary-700 border-primary-600/50 ";
  return (
    <div className="w-1/6 bg-primary-800 border-r border border-primary-700 flex sticky top-16">
      <div className="w-full px-2 pt-4">
        {/* Team boards button  */}
        <div className={sidebarButtonStyle + " border-transparent"}>
          <div className="flex items-center">
            <div className={iconBoxStyle}>
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
          <div className="flex items-center">
            <div className={iconBoxStyle}>
              <FaPlus
                className="m-auto group-hover:fill-white h-full w-full"
                style={{ padding: 5 }}
                size={12}
              />
            </div>
            New board
          </div>
        </div>

        <LineSeparator />
        <div className="subtext py-2">MY DASHBOARDS</div>
        {project && project.boards ? (
          project.boards.map((board: any) => {
            return (
              <div
                key={board.id}
                className={
                  (isSelectedBoard
                    ? selectedBoardButtonStyle
                    : "border-transparent") + sidebarButtonStyle
                }
              >
                <div className="mr-2">🥳</div>
                {board.name}
                <PiCaretLeftFill
                  fill={colors.primary[900]}
                  size={50}
                  className="absolute"
                  style={{ right: -30 }}
                />
              </div>
            );
          })
        ) : (
          //PLACEHOLDER
          <div
            className={
              (isSelectedBoard
                ? selectedBoardButtonStyle
                : "border-transparent") + sidebarButtonStyle
            }
          >
            <div className="mr-2">🥳</div>
            My dashboard
            <PiCaretLeftFill
              fill={colors.primary[900]}
              size={50}
              className="absolute"
              style={{ right: -30 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
