import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "./trpc";
import { useEffect } from "react";

export const useFetchProjectBoards = () => {
  const { data: meData } = trpc.getMe.useQuery();
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const router = useRouter();
  const { lastBoardId, lastProjectId, set } =
    useLastSelectedProjectBoardStore();
  const utils = trpc.useUtils();
  const currProjectId = urlProjectId || lastProjectId;
  const { data, isLoading } = trpc.getBoards.useQuery({
    projectId: currProjectId,
  });
  useEffect(() => {
    if (urlProjectId && urlProjectId !== lastProjectId) {
      set({ lastProjectId: urlProjectId });
    }
  }, [urlProjectId]);

  const project = currProjectId
    ? meData?.projects.find((p) => p.id === currProjectId)
    : meData?.projects[0];

  useEffect(() => {
    if (!project && meData?.projects.length) {
      router.replace(`/p/${meData.projects[0].id}`);
    }
  }, [meData]);

  const board = lastBoardId
    ? data?.boards.find((b) => b.id === lastBoardId) || data?.boards[0]
    : data?.boards[0];

  return {
    isLoading,
    project,
    board,
    boards: data?.boards,
    projects: meData?.projects,
  };
};
