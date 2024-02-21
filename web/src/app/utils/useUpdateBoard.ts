import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "./trpc";

export const useUpdateBoard = () => {
  const { lastProjectId } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  const utils = trpc.useUtils();
  return trpc.updateBoard.useMutation({
    onSuccess: (data) => {
      utils.getProjects.setData({ currProjectId: lastProjectId }, (old) => {
        if (!old) {
          return old;
        }

        return {
          boards: old.boards.map((b) => (b.id === boardId ? data.board : b)),
          projects: old.projects,
        };
      });
    },
  });
};
