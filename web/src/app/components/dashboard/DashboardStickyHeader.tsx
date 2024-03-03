import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "../../ui/Button";
import { FaPlus } from "react-icons/fa6";
import { RouterOutput, trpc } from "../../utils/trpc";
import { AddRandomEmojiButton } from "./AddRandomEmojiButton";
import { EditableTextField } from "../../ui/EditableTextField";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { BoardEmojiPicker } from "./BoardEmojiPicker";
import { useParams } from "next/navigation";

interface DashboardStickyHeaderProps {
  board: RouterOutput["getBoards"]["boards"][0];
}

export const DashboardStickyHeader: React.FC<DashboardStickyHeaderProps> = ({
  board,
}) => {
  const { projectId } = useParams<{
    projectId: string;
  }>();
  const { lastProjectId } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.updateBoard.useMutation({
    onSuccess: (data) => {
      utils.getBoards.setData({ projectId: lastProjectId }, (old) => {
        if (!old) {
          return old;
        }

        return {
          boards: old.boards.map((b) => (b.id === boardId ? data.board : b)),
        };
      });
    },
  });
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);

  return (
    <div className="flex flex-row items-center justify-between px-6 sticky top-0 bg-primary-900">
      {/* Dashboard title */}
      <div className="py-4 flex-1 flex-row">
        {/* Note: might be preferable in the future to stick the route at the top for better navigation, but for now we'll stick the title.*/}
        <div className="text-3xl font-bold flex flex-row py-1 ">
          <div
            className="mr-2 hover:bg-primary-700 h-8 w-8 text-center rounded-lg cursor-pointer"
            onClick={() => {
              setEmojiPickerOpen(true);
              console.log("emoji clicked");
            }}
          >
            {board.emoji ? board.emoji : <AddRandomEmojiButton />}
          </div>

          <EditableTextField
            key={board.id}
            onDone={(newText) => {
              mutateAsync({
                id: boardId,
                projectId,
                data: { title: newText },
              });
            }}
            text={board.title.trim() ? board.title : "Untitled"}
          />
        </div>
        {emojiPickerOpen ? (
          <BoardEmojiPicker onDone={() => setEmojiPickerOpen(false)} />
        ) : null}

        <div className="flex ml-10">
          <div className="text-xs subtext px-1 rounded-md">
            <EditableTextField
              key={board.id}
              onDone={(newText) => {
                mutateAsync({
                  id: boardId,
                  projectId,
                  data: { description: newText },
                });
              }}
              text={board.description?.trim() ? board.description : ""}
              placeholder="Add description"
            />
          </div>
        </div>
      </div>

      {/* Placeholder bank for little buttons */}
      <div></div>

      {/* New chart button */}
      <Link href={`/p/${projectId}/chart?idx=${board.positions?.length || 0}`}>
        <Button>
          <div className="flex items-center">
            <FaPlus className="mr-2" /> New chart
          </div>
        </Button>
      </Link>
    </div>
  );
};
