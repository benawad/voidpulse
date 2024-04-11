import React from "react";
import { FaPlus } from "react-icons/fa6";
import { trpc } from "../../utils/trpc";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";

interface AddBoardButtonProps {}

export const AddBoardButton: React.FC<AddBoardButtonProps> = ({}) => {
  const { lastProjectId, set } = useLastSelectedProjectBoardStore();
  const { projectId } = useProjectBoardContext();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.createBoard.useMutation({
    onSuccess: (data) => {
      utils.getBoards.setData({ projectId: lastProjectId }, (old) => {
        if (!old) {
          return {
            boards: [data.board],
          };
        }

        return {
          boards: [...old.boards, data.board],
        };
      });
      utils.getMe.setData(undefined, (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          projects: old.projects.map((p) => {
            if (p.id === lastProjectId) {
              return {
                ...p,
                boardOrder: [...(p.boardOrder || []), data.board.id],
              };
            }
            return p;
          }),
        };
      });
      set({ lastBoardId: data.board.id });
    },
  });

  return (
    <button
      onClick={() =>
        mutateAsync({
          projectId,
          title: "Untitled",
        })
      }
      disabled={isPending}
      className="flex items-center w-full"
    >
      <div className={"icon-box"}>
        <FaPlus
          className="m-auto group-hover:fill-white h-full w-full"
          style={{ padding: 5 }}
          size={12}
        />
      </div>
      New board
    </button>
  );
};
