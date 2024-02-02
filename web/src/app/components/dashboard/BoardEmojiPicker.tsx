import EmojiPicker, { SuggestionMode, Theme } from "emoji-picker-react";
import React, { useEffect, useRef } from "react";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "../../utils/trpc";

interface BoardEmojiPickerProps {
  onDone: () => void;
}

export const BoardEmojiPicker: React.FC<BoardEmojiPickerProps> = ({
  onDone,
}) => {
  const { lastProjectId } = useLastSelectedProjectBoardStore();
  const { boardId } = useProjectBoardContext();
  const utils = trpc.useUtils();
  const pickerRef = useRef<HTMLDivElement>(null);

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

  // Happens when you click outside the picker
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      console.log("handling click");
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        console.log("handling outside click");
        onDone();
      }
    };
    //Checks if you are outside the input once your mouse moves
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="absolute" ref={pickerRef}>
      <EmojiPicker
        suggestedEmojisMode={SuggestionMode.RECENT}
        autoFocusSearch={true}
        theme={Theme.DARK}
        width={300}
        onEmojiClick={(emoji) => {
          onDone();
          mutateAsync({
            id: boardId,
            data: { emoji: emoji.emoji },
          });
          console.log(emoji);
        }}
        previewConfig={{
          showPreview: false,
        }}
      />
    </div>
  );
};
