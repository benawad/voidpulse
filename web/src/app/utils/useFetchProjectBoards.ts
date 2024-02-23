import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "./trpc";
import { useEffect } from "react";

export const useFetchProjectBoards = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const router = useRouter();
  const { lastBoardId, lastProjectId, set } =
    useLastSelectedProjectBoardStore();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.getProjects.useQuery({
    currProjectId: projectId || lastProjectId,
  });
  useEffect(() => {
    if (projectId && projectId !== lastProjectId) {
      set({ lastProjectId: projectId });
    }
  }, [projectId]);

  const project = lastProjectId
    ? data?.projects.find((p) => p.id === lastProjectId)
    : data?.projects[0];

  useEffect(() => {
    if (!project && data?.projects.length) {
      utils.getProjects.setData({ currProjectId: data.projects[0].id }, () => {
        return data;
      });
      router.replace(`/p/${data.projects[0].id}`);
    }
  }, [data]);

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
