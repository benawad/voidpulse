import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "../../ui/Button";
import { FaPlus } from "react-icons/fa6";
import { RouterOutput } from "../../utils/trpc";
import { AddRandomEmojiButton } from "./AddRandomEmojiButton";
import { Input } from "../../ui/Input";
import { EditableTextField } from "../../ui/EditableTextField";

interface DashboardStickyHeaderProps {
  board: RouterOutput["getProjects"]["boards"][0];
}

export const DashboardStickyHeader: React.FC<DashboardStickyHeaderProps> = ({
  board,
}) => {
  return (
    <div className="flex-1 flex flex-row items-center justify-between px-6 sticky top-16 bg-primary-900 z-10">
      {/* Dashboard title */}
      <div className="py-4 flex-1 flex-row">
        {/* Note: might be preferable in the future to stick the route at the top for better navigation, but for now we'll stick the title.*/}
        <div className="text-3xl font-bold flex flex-row py-1 ">
          <div className="mr-2 hover:bg-primary-700 h-8 w-8 text-center rounded-lg cursor-pointer">
            {board.emoji ? board.emoji : <AddRandomEmojiButton />}
          </div>
          <EditableTextField
            key={board.id}
            onTextChange={() => {}}
            text={board.title.trim() ? board.title : "Untitled"}
          />
        </div>
        <div className="flex ml-10">
          <div className="text-xs subtext px-1 rounded-md">
            <EditableTextField
              onTextChange={() => {}}
              text={
                board.description?.trim()
                  ? board.description
                  : "Add description..."
              }
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
