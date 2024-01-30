import React from "react";
import { PiCaretLeftFill } from "react-icons/pi";
import config from "../../../../tailwind.config";
import { FaPlus } from "react-icons/fa6";
const colors = config.theme.extend.colors;

interface DashboardNavigatorProps {
  project?: any;
}

export const DashboardNavigator: React.FC<DashboardNavigatorProps> = ({
  project,
}) => {
  //PLACEHOLDER
  const isSelectedBoard = true;

  return (
    <div className="w-1/6 bg-primary-800 border-r border border-primary-700 flex sticky top-16">
      <div className="w-full px-2 pt-4">
        {/* New board button  */}
        <div
          className={
            "border border-primary-800 " +
            "accent-hover group flex p-2 rounded-lg w-full items-center relative "
          }
        >
          <div className="flex items-center">
            <div className="accent-hover group-hover:bg-secondary-signature-100 bg-primary-600 w-6 h-6 rounded-md mr-3">
              <FaPlus
                className="m-auto group-hover:fill-white h-full w-full"
                style={{ padding: 5 }}
                size={12}
              />
            </div>
            New board
          </div>
        </div>

        {/* Line separator */}
        <div className="w-full bg-primary-700 my-2" style={{ height: 1 }}></div>

        <div className="subtext py-2">MY DASHBOARDS</div>
        {project && project.boards ? (
          project.boards.map((board: any) => {
            return (
              <div
                key={board.id}
                className={
                  (isSelectedBoard
                    ? "bg-primary-700 border border-primary-800 "
                    : "") +
                  "accent-hover flex p-2 rounded-lg w-full items-center relative"
                }
              >
                <div className="mr-2">🥳</div>
                {board.name}
                <PiCaretLeftFill
                  fill={colors.primary[900]}
                  size={50}
                  className="absolute"
                  style={{ right: -30 }}
                />{" "}
              </div>
            );
          })
        ) : (
          //PLACEHOLDER
          <div
            className={
              (isSelectedBoard
                ? "bg-primary-700 border border-primary-800 "
                : "") +
              "accent-hover flex p-2 rounded-lg w-full items-center relative "
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
