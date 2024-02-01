"use client";
import { useParams } from "next/navigation";
import { ProjectBoardProvider } from "../../../providers/ProjectBoardProvider";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { ChartEditor } from "./ChartEditor";

function Page() {
  const { isLoading, board, project, projects, boards } =
    useFetchProjectBoards();
  const { id } = useParams<{ id?: string }>();
  const { data, isLoading: loadingChart } = trpc.getCharts.useQuery(
    {
      boardId: board?.id!,
      projectId: project?.id!,
    },
    {
      enabled: !!(project && board && id),
    }
  );

  if (isLoading || loadingChart) {
    return null;
  }

  if (!board || !project || !projects || !boards) {
    return <div>no project or boards ?</div>;
  }

  const chart = data?.charts.find((chart) => chart.id === id);

  return (
    <div className="page">
      <ProjectBoardProvider projectId={project.id} boardId={board.id}>
        <HeaderNav />
        <ChartEditor chart={chart} />
      </ProjectBoardProvider>
    </div>
  );
}

export default trpc.withTRPC(Page);
