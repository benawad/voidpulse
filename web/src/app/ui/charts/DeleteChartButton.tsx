import React from "react";
import { IoTrashOutline } from "react-icons/io5";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "../../utils/trpc";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";

interface DeleteChartButtonProps {
  chartId: string;
  onClick: (e: any) => void;
}

export const DeleteChartButton: React.FC<DeleteChartButtonProps> = ({
  onClick,
  chartId,
}) => {
  const { projectId, boardId } = useProjectBoardContext();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.deleteChart.useMutation({
    // After successful db deletion, remove the board from the local list of boards.
    onSuccess: (data) => {
      utils.getCharts.setData({ projectId, boardId }, (oldData) => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          charts: oldData.charts.filter((chart) => chart.id !== chartId),
        };
      });
    },
  });

  return (
    <button
      disabled={isPending}
      className="flex justify-start items-center p-2 rounded-lg text-negative-100 group-hover:text-negative-100 hover:bg-negative-100/30"
      onClick={() => {
        mutateAsync({ projectId, boardId, chartId });
      }}
    >
      <IoTrashOutline className="mr-2" />
      Delete
    </button>
  );
};
