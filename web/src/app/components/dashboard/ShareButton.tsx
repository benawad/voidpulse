import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { FaShare, FaCopy, FaCheck } from "react-icons/fa";
import { trpc } from "../../utils/trpc";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

interface ShareButtonProps {
  board: {
    id: string;
    title: string;
    shareToken?: string | null;
  };
}

export const ShareButton: React.FC<ShareButtonProps> = ({ board }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();
  const { boardId } = useProjectBoardContext();

  const utils = trpc.useUtils();

  const generateShareTokenMutation = trpc.generateShareToken.useMutation({
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/shared/${data.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    },
    onError: (error) => {
      toast.error("Failed to generate share link");
      console.error(error);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const disableSharingMutation = trpc.disableSharing.useMutation({
    onSuccess: () => {
      toast.success("Sharing disabled");
      utils.getBoards.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to disable sharing");
      console.error(error);
    },
  });

  const handleShare = async () => {
    if (board.shareToken) {
      // Copy existing share link
      const shareUrl = `${window.location.origin}/shared/${board.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      // Generate new share token
      setIsGenerating(true);
      generateShareTokenMutation.mutate({
        boardId,
        projectId,
      });
    }
  };

  const handleDisableSharing = () => {
    disableSharingMutation.mutate({
      boardId,
      projectId,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleShare}
        disabled={isGenerating}
        variant={board.shareToken ? "secondary" : "primary"}
      >
        <div className="flex items-center">
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : isCopied ? (
            <FaCheck className="mr-2" />
          ) : (
            <FaShare className="mr-2" />
          )}
          {isGenerating ? "Generating..." : isCopied ? "Copied!" : "Share"}
        </div>
      </Button>

      {board.shareToken && (
        <Button
          onClick={handleDisableSharing}
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300"
        >
          Disable
        </Button>
      )}
    </div>
  );
};
