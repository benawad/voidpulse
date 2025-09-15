import React from "react";
import { FaEye } from "react-icons/fa";

interface SharedBoardHeaderProps {
  board: {
    id: string;
    title: string;
    description: string | null;
    emoji: string | null;
    project: {
      id: string;
      name: string;
    };
    creator: {
      id: string;
      email: string;
    };
  };
}

export const SharedBoardHeader: React.FC<SharedBoardHeaderProps> = ({
  board,
}) => {
  return (
    <div className="bg-primary-800 border-b border-primary-700">
      <div className="px-6 py-4">
        {/* Top row with project name and view-only indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-400">
              {board.project.name}
            </span>
            <span className="text-primary-500">•</span>
            <span className="text-sm text-primary-400">
              Shared by {board.creator.email}
            </span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <FaEye className="text-sm" />
            <span className="text-sm">View Only</span>
          </div>
        </div>

        {/* Board title and description */}
        <div className="flex items-start gap-3">
          {board.emoji && <div className="text-3xl">{board.emoji}</div>}

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {board.title}
            </h1>

            {board.description && (
              <p className="text-primary-300 text-sm">{board.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
