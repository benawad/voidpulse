import React from "react";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { trpc } from "../../utils/trpc";
import { ChartThumbnail } from "./ChartThumbnail";

interface ChartsGridProps {}

export const ChartsGrid: React.FC<ChartsGridProps> = ({}) => {
  const { boardId, projectId } = useProjectBoardContext();
  const { data } = trpc.getCharts.useQuery({
    boardId,
    projectId,
  });
  return (
    <div className="grid text-center p-8 lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-left">
      {data?.charts.map((chart) => {
        return (
          <div key={chart.id} className="m-2">
            <ChartThumbnail chart={chart} />
          </div>
        );
      })}
    </div>
  );
};
