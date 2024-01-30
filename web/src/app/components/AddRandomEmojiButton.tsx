import React from "react";
import { FaPlus } from "react-icons/fa6";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { trpc } from "../utils/trpc";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";

interface AddEmojiButtonProps {}

export const AddRandomEmojiButton: React.FC<AddEmojiButtonProps> = ({}) => {
  const { lastProjectId } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.updateBoard.useMutation({
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

  return (
    <button
      disabled={isPending}
      onClick={() => {
        mutateAsync({
          id: boardId,
          data: { randomEmoji: true },
        });
      }}
    >
      <FaPlus
        className="m-auto fill-white/30 group-hover:fill-white h-full w-full"
        style={{ padding: 6 }}
        size={12}
      />
    </button>
  );
};
