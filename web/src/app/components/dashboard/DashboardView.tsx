import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ProjectBoardProvider } from "../../../../providers/ProjectBoardProvider";
import { useFetchProjectBoards } from "../../utils/useFetchProjectBoards";
import { ChartsGrid } from "./dashboard-grid/ChartsGrid";
import { DashboardNavigator } from "./DashboardNavigator";
import { DashboardStickyHeader } from "./DashboardStickyHeader";
import { DndProvider } from "react-dnd";
import { trpc } from "../../utils/trpc";

interface DashboardViewProps {}

export const DashboardView: React.FC<DashboardViewProps> = ({}) => {
  const { isLoading, board, project, projects, boards } =
    useFetchProjectBoards();
  const { data, isLoading: loadingCharts } = trpc.getCharts.useQuery(
    {
      boardId: board?.id!,
      projectId: project?.id!,
    },
    {
      enabled: !!board && !!project,
    }
  );

  if (isLoading) {
    return null;
  }

  if (!board || !project || !projects || !boards) {
    return <div>no project or boards ?</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectBoardProvider projectId={project.id} boardId={board.id}>
        <div className="flex flex-row-reverse flex-1 overflow-auto">
          <div className="flex-1 relative flex flex-col h-full overflow-auto">
            <DashboardStickyHeader board={board} />
            {loadingCharts ? null : (
              <ChartsGrid
                key={board.id}
                charts={data?.charts || []}
                board={board}
              />
            )}
          </div>
          <DashboardNavigator boards={boards} />
        </div>
      </ProjectBoardProvider>
    </DndProvider>
  );
};
