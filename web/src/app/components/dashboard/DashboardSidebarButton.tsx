import React from "react";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { RouterOutput } from "../../utils/trpc";
import { PiCaretLeftFill } from "react-icons/pi";
import { MoreBoardOptionsButton } from "../../ui/MoreBoardOptionsButton";
import { useCurrTheme } from "../../themes/useCurrTheme";

interface DashboardSidebarButtonProps {
  board: RouterOutput["getProjects"]["boards"][0];
}

export const DashboardSidebarButton: React.FC<DashboardSidebarButtonProps> = ({
  board,
}) => {
  const { set } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  const isSelectedBoard = board.id === boardId;
  const sidebarButtonStyle =
    " accent-hover ring-0 group flex p-2 rounded-lg w-full items-center justify-between relative ";
  const selectedBoardButtonStyle = " bg-primary-700 ring-primary-600/50 ";
  const { theme } = useCurrTheme();

  return (
    <div
      onClick={() => {
        set({ lastBoardId: board.id });
      }}
      key={board.id}
      className={
        sidebarButtonStyle +
        (isSelectedBoard ? selectedBoardButtonStyle : " border-transparent")
      }
    >
      <div className="flex flex-row overflow-hidden">
        <div className="mr-2">{board.emoji}</div>
        <div className="w-full text-ellipsis truncate">{board.title}</div>
      </div>
      <MoreBoardOptionsButton boardId={board.id} boardTitle={board.title} />
      {boardId === board.id ? (
        <PiCaretLeftFill
          fill={theme.primary[900]}
          size={40}
          className="absolute -z-10"
          style={{ right: -32 }}
        />
      ) : null}
    </div>
  );
};
