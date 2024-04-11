import React, { useRef } from "react";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { RouterOutput, trpc } from "../../utils/trpc";
import { PiCaretLeftFill } from "react-icons/pi";
import { MoreBoardOptionsButton } from "../../ui/MoreBoardOptionsButton";
import { useCurrTheme } from "../../themes/useCurrTheme";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { ItemTypes } from "./dashboard-grid/DraggableChartContainer";

interface DashboardSidebarButtonProps {
  board: RouterOutput["getBoards"]["boards"][0];
}

export const DashboardSidebarButton: React.FC<DashboardSidebarButtonProps> = ({
  board,
}) => {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.updateChart.useMutation();
  const handler = (item: any, __: DropTargetMonitor<any, unknown>) => {
    const chartId = item.chartId;
    if (board.id === item.boardId) {
      return;
    }
    mutateAsync({
      id: chartId,
      projectId: board.projectId,
      updateData: {
        boardId: board.id,
      },
    }).then(({ chart }) => {
      // remove from old board
      utils.getCharts.setData(
        { projectId: board.projectId, boardId: item.boardId },
        (d) => {
          if (!d) return d;
          return {
            ...d,
            charts: d.charts.filter((c) => c.id !== chartId),
          };
        }
      );
      // add to new board
      utils.getCharts.setData(
        { projectId: board.projectId, boardId: board.id },
        (d) => {
          if (!d) return d;
          return {
            ...d,
            charts: [...d.charts, chart],
          };
        }
      );
    });
  };
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CHART,
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: (item: any, monitor) => handlerRef.current(item, monitor),
  }));
  const { set } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  const isSelectedBoard = board.id === boardId;
  const sidebarButtonStyle =
    " accent-hover ring-0 group flex p-2 rounded-lg w-full items-center justify-between relative ";
  const selectedBoardButtonStyle = " bg-primary-700 ring-primary-600/50 ";
  const { theme } = useCurrTheme();

  return (
    <button
      ref={drop}
      onClick={() => {
        set({ lastBoardId: board.id });
      }}
      key={board.id}
      style={{
        backgroundColor: isOver ? theme.primary[900] : undefined,
      }}
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
    </button>
  );
};
