import EmojiPicker, { SuggestionMode, Theme } from "emoji-picker-react";
import React from "react";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { trpc } from "../../utils/trpc";

interface MyEmojiPickerProps {
  onEmojiPicked: () => void;
}

export const MyEmojiPicker: React.FC<MyEmojiPickerProps> = ({
  onEmojiPicked,
}) => {
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
    <div className="absolute">
      <EmojiPicker
        suggestedEmojisMode={SuggestionMode.RECENT}
        autoFocusSearch={true}
        theme={Theme.DARK}
        width={300}
        onEmojiClick={(emoji) => {
          onEmojiPicked();
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
