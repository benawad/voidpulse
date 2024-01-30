import React from "react";
import { PiCaretLeftFill } from "react-icons/pi";
import config from "../../../../tailwind.config";
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
    <div className="w-1/6 bg-primary-800 border-r border border-primary-700 flex">
      <div className="w-full px-2 pt-4">
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
                {board.name}
                {isSelectedBoard || true ? (
                  <PiCaretLeftFill fill="#fff" />
                ) : null}
              </div>
            );
          })
        ) : (
          <div
            className={
              (isSelectedBoard
                ? "bg-primary-700 border border-primary-800 "
                : "") +
              "accent-hover flex p-2 rounded-lg w-full items-center relative "
            }
          >
            No boards
            <PiCaretLeftFill
              fill={colors.primary[900]}
              size={40}
              className="absolute"
              style={{ right: -33 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
