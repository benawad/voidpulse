"use client";
import { ProjectBoardProvider } from "../../../providers/ProjectBoardProvider";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { ChartEditor } from "./ChartEditor";

function Page() {
  const { isLoading, board, project, projects, boards } =
    useFetchProjectBoards();

  if (isLoading) {
    return null;
  }

  if (!board || !project || !projects || !boards) {
    return <div>no project or boards ?</div>;
  }

  return (
    <div className="page">
      <ProjectBoardProvider projectId={project.id} boardId={board.id}>
        <HeaderNav />
        <ChartEditor />
      </ProjectBoardProvider>
    </div>
  );
}

export default trpc.withTRPC(Page);
