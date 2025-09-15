import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ChartsGrid } from "../../components/dashboard/dashboard-grid/ChartsGrid";
import { SharedBoardHeader } from "./SharedBoardHeader";

interface SharedBoardViewProps {
  board: {
    id: string;
    title: string;
    description: string | null;
    emoji: string | null;
    positions: any;
    project: {
      id: string;
      name: string;
    };
    creator: {
      id: string;
      email: string;
    };
  };
  charts: any[];
}

export const SharedBoardView: React.FC<SharedBoardViewProps> = ({
  board,
  charts,
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-primary-900">
        {/* Header */}
        <SharedBoardHeader board={board} />

        {/* Board Content */}
        <div className="flex flex-col h-full">
          <div className="flex-1 relative flex flex-col h-full overflow-auto">
            <ChartsGrid
              key={board.id}
              charts={charts}
              board={board}
              isViewOnly={true}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
