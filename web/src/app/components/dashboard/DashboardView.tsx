import React from "react";
import { ProjectBoardProvider } from "../../../../providers/ProjectBoardProvider";
import { useFetchProjectBoards } from "../../utils/useFetchProjectBoards";
import { ChartsGrid } from "./ChartsGrid";
import { DashboardNavigator } from "./DashboardNavigator";
import { DashboardStickyHeader } from "./DashboardStickyHeader";

interface DashboardViewProps {}

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
