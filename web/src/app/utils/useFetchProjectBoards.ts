import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "./trpc";

export const useFetchProjectBoards = () => {
  const { lastBoardId, lastProjectId } = useLastSelectedProjectBoardStore();
  const { data, isLoading } = trpc.getProjects.useQuery({
    currProjectId: lastProjectId,
  });

  const project = lastProjectId
    ? data?.projects.find((p) => p.id === lastProjectId) || data?.projects[0]
    : data?.projects[0];

  const board = lastBoardId
    ? data?.boards.find((b) => b.id === lastBoardId) || data?.boards[0]
    : data?.boards[0];

  return {
    isLoading,
    project,
    board,
    boards: data?.boards,
    projects: data?.projects,
  };
};
