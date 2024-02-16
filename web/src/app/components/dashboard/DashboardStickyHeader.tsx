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

interface DashboardStickyHeaderProps {
  board: RouterOutput["getProjects"]["boards"][0];
}

export const DashboardStickyHeader: React.FC<DashboardStickyHeaderProps> = ({
  board,
}) => {
  //API call for updating board info
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
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);

  return (
    <div className="flex flex-row items-center justify-between px-6 sticky top-16 bg-primary-900 z-10">
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
      <Link href="/chart">
        <Button>
          <div className="flex items-center">
            <FaPlus className="mr-2" /> New chart
          </div>
        </Button>
      </Link>
    </div>
  );
};
