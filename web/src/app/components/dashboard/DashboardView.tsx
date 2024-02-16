import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ProjectBoardProvider } from "../../../../providers/ProjectBoardProvider";
import { useFetchProjectBoards } from "../../utils/useFetchProjectBoards";
import { ChartsGrid } from "./dashboard-grid/ChartsGrid";
import { DashboardNavigator } from "./DashboardNavigator";
import { DashboardStickyHeader } from "./DashboardStickyHeader";
import { DndProvider } from "react-dnd";

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
    <DndProvider backend={HTML5Backend}>
      <ProjectBoardProvider projectId={project.id} boardId={board.id}>
        <div className="flex flex-row-reverse flex-1">
          <div className="flex-1 relative flex flex-col">
            <DashboardStickyHeader board={board} />
            <ChartsGrid />
          </div>
          <DashboardNavigator boards={boards} />
        </div>
      </ProjectBoardProvider>
    </DndProvider>
  );
};
