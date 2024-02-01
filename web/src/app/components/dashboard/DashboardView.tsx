import React, { useEffect } from "react";
import { ChartThumbnail } from "./ChartThumbnail";
import { placeholderCharts } from "../../ui/charts/PlaceholderChartData";
import { trpc } from "../../utils/trpc";
import { DashboardStickyHeader } from "./DashboardStickyHeader";
import { DashboardNavigator } from "./DashboardNavigator";
import { HeaderNav } from "../../ui/HeaderNav";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { ProjectBoardProvider } from "../../../../providers/ProjectBoardProvider";
import { useFetchProjectBoards } from "../../utils/useFetchProjectBoards";
import { ChartsGrid } from "./ChartsGrid";

interface DashboardViewProps {}
let charts = placeholderCharts;

export const DashboardView: React.FC<DashboardViewProps> = ({}) => {
  const { isLoading, board, project, projects, boards } =
    useFetchProjectBoards();

  if (isLoading) {
    return null;
  }

  if (!board || !project || !projects || !boards) {
    return <div>no project or boards ?</div>;
  }

  return (
    <ProjectBoardProvider projectId={project.id} boardId={board.id}>
      <div className="flex flex-row-reverse flex-1">
        <div className="flex-1 relative">
          <DashboardStickyHeader board={board} />
          <div>
            {/* Grid of charts */}
            <ChartsGrid />
          </div>
        </div>
        <DashboardNavigator boards={boards} />
      </div>
    </ProjectBoardProvider>
  );
};
